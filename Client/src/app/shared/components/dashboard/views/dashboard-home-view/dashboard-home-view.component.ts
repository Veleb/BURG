import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UserFromDB } from '../../../../../../types/user-types';
import { CurrencyConverterPipe } from '../../../../pipes/currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { CompanyInterface } from '../../../../../../types/company-types';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject, throwError, switchMap, map, catchError, takeUntil, of } from 'rxjs';
import { HostService } from '../../../../../services/host.service';
import { RentService } from '../../../../../rents/rent.service';
import { RentInterface } from '../../../../../../types/rent-types';
import { RentCardComponent } from '../../../../../rents/rent-card/rent-card.component';
import { UserService } from '../../../../../user/user.service';
import { VehicleService } from '../../../../../vehicle/vehicle.service';
import { CurrencyService } from '../../../../../currency/currency.service';

@Component({
  selector: 'app-dashboard-home-view',
  imports: [CurrencyConverterPipe, CurrencyPipe, RentCardComponent],
  templateUrl: './dashboard-home-view.component.html',
  styleUrl: './dashboard-home-view.component.css'
})
export class DashboardHomeViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private hostService = inject(HostService);
  private rentService = inject(RentService);
  private vehicleService = inject(VehicleService);
  private userService = inject(UserService);
  private currencyService = inject(CurrencyService)

  private destroy$ = new Subject<void>();

  error: string | null = null;
  loading: boolean = true;
  user?: UserFromDB;
  company?: CompanyInterface;
  allCompanies: CompanyInterface[] = [];
  activeRents: RentInterface[] = [];
  totalVehicles = 0;
  totalEarnings = 0;
  selectedCurrency: string = 'USD';

  ngOnInit(): void {

    this.rentService.getAll();
    this.vehicleService.getAll()

    this.currencyService.getCurrency()
    .pipe(takeUntil(this.destroy$))
    .subscribe(currency => {
      this.selectedCurrency = currency;
    });

    this.userService.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {

      if (!user) {
        this.router.navigate(['/auth/login']);
        return;
      }
      
      this.user = user;

      if (user?.role === 'admin') {
        this.loadAdminData();
      } else if (user?.role === 'host') {
        this.loadHostData();
      }
    });
  }

  private loadAdminData(): void {
    combineLatest([
      this.route.queryParamMap,
      this.rentService.rents$,
      this.vehicleService.vehicles$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([params, rents, vehicles]) => {

        const companyId = params.get('companyId');

        if (companyId) {
          this.hostService.getCompanyById(companyId).subscribe({
            next: (company) => {
              this.company = company;
            }
          })
        } else {
          this.error = 'Company ID is missing';
        }

        this.activeRents = rents;
        
        this.totalEarnings = rents.reduce((sum, rent) => sum + (rent.total || 0), 0);
        
        this.totalVehicles = vehicles.length
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load admin data';
        this.loading = false;
      }
    });
  }

  private loadHostData(): void {
    this.route.queryParamMap.pipe(
      switchMap(params => {
        const companyId = params.get('companyId');
        if (!companyId) {
          this.error = 'No company selected';
          return throwError(() => new Error('No company selected'));
        }
        
        return combineLatest([
          this.hostService.getCompanyById(companyId),
          this.rentService.getRentsByCompany(companyId)
        ]);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([company, rents]) => {
        this.company = company;
        this.activeRents = rents;
        this.totalEarnings = company.totalEarnings || 0;
        this.totalVehicles = company.carsAvailable?.length || 0;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load company data';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}