import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { HostService } from '../../../../services/host.service';
import { ActivatedRoute } from '@angular/router';
import { CompanyInterface } from '../../../../../types/company-types';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { RentInterface } from '../../../../../types/rent-types';
import { RentService } from '../../../../rents/rent.service';
import { RentCardComponent } from '../../../../rents/rent-card/rent-card.component';
import { CurrencyPipe } from '@angular/common';
import { CurrencyConverterPipe } from '../../../../shared/pipes/currency.pipe';

@Component({
  selector: 'app-home-view',
  imports: [RentCardComponent, CurrencyPipe, CurrencyConverterPipe],
  templateUrl: './home-view.component.html',
  styleUrl: './home-view.component.css'
})
export class HomeViewComponent implements OnInit, OnDestroy {
  // @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  private destroy$ = new Subject<void>();
  
  chart: Chart | undefined;
  loading = true;
  error: string | null = null;
  company: CompanyInterface | null = null;
  earningsData: number[] = [];
  activeRents: RentInterface[] = []

  constructor(
    private hostService: HostService,
    private route: ActivatedRoute,
    private rentService: RentService,
  ) {}

  ngOnInit(): void {
    this.loadCompanyData();
  }

  ngOnDestroy(): void {
    // this.destroyChart();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCompanyData(): void {
    this.route.queryParamMap.pipe(
      switchMap(params => {
        const companyId = params.get('companyId');
        if (!companyId) {
          this.error = 'No company ID provided';
          return throwError(() => new Error(this.error ?? 'Unknown error'));
        }
        return this.hostService.getCompanyById(companyId).pipe(
        switchMap((companyData: CompanyInterface) => 
          this.rentService.getRentsByCompany(companyData._id as string).pipe(
            map(rents => ({ companyData, rents }))
          )
        ),
          catchError(err => {
            this.error = 'Failed to load company data';
            return throwError(() => err);
          })
        )
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ companyData, rents }) => {
        this.company = companyData;
        this.activeRents = rents;
        
        // this.loadEarningsData();
        // this.initializeChart();
      },
      error: (err) => {
        console.error('Error loading company:', err);
        this.loading = false;
      }
    });
  }

  // private loadEarningsData(): void {
  //   if (!this.company) return;

  //   this.earningsData = this.calculateEarnings();
  //   this.loading = false;
  // }

  // private calculateEarnings(): number[] {
    
  //   return [0]
  // }

  // private initializeChart(): void {
  //   if (!this.chartCanvas?.nativeElement) return;

  //   this.destroyChart();

  //   this.chart = new Chart(this.chartCanvas.nativeElement, {
  //     type: 'line',
  //     data: {
  //       labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  //       datasets: [{
  //         label: 'Monthly Earnings',
  //         data: this.earningsData,
  //         borderColor: '#3498db',
  //         backgroundColor: 'rgba(52, 152, 219, 0.1)',
  //         tension: 0.4,
  //         borderWidth: 2
  //       }]
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       scales: {
  //         y: {
  //           beginAtZero: true,
  //           title: {
  //             display: true,
  //             text: 'Earnings (USD)'
  //           }
  //         }
  //       },
  //       plugins: {
  //         tooltip: {
  //           mode: 'index',
  //           intersect: false
  //         }
  //       }
  //     }
  //   });
  // }

  // private destroyChart(): void {
  //   if (this.chart) {
  //     this.chart.destroy();
  //     this.chart = undefined;
  //   }
  // }

  retry(): void {
    this.error = null;
    this.loading = true;
    this.loadCompanyData();
  }
}