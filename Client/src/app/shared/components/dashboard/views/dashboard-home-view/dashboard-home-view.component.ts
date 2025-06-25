import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UserFromDB } from '../../../../../../types/user-types';
import { CurrencyConverterPipe } from '../../../../pipes/currency.pipe';
import { CompanyInterface } from '../../../../../../types/company-types';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { RentService } from '../../../../../rents/rent.service';
import { RentInterface } from '../../../../../../types/rent-types';
import { RentCardComponent } from '../../../../../rents/rent-card/rent-card.component';
import { UserService } from '../../../../../user/user.service';
import { VehicleService } from '../../../../../vehicle/vehicle.service';
import { CurrencyService } from '../../../../../currency/currency.service';
import { CompanyService } from '../../../../../company/company.service';

@Component({
  selector: 'app-dashboard-home-view',
  standalone: true,
  imports: [CurrencyConverterPipe, RentCardComponent],
  templateUrl: './dashboard-home-view.component.html',
  styleUrl: './dashboard-home-view.component.css'
})
export class DashboardHomeViewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private companyService = inject(CompanyService);
  private rentService = inject(RentService);
  private vehicleService = inject(VehicleService);
  private userService = inject(UserService);
  private currencyService = inject(CurrencyService);

  private destroy$ = new Subject<void>();

  error: string | null = null;
  loading: boolean = true;
  user?: UserFromDB;
  company?: CompanyInterface;

  activeRents: RentInterface[] = [];
  totalVehicles = 0;
  totalRents = 0;
  totalEarnings = 0;
  selectedCurrency: string = 'INR';

  ngOnInit(): void {
    this.currencyService.getCurrency()
      .pipe(takeUntil(this.destroy$))
      .subscribe(currency => {
        this.selectedCurrency = currency;
      });

    combineLatest([
      this.userService.user$,
      this.route.queryParamMap
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([user, params]) => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return;
        }

        this.user = user;

        const companySlug = params.get('companySlug');

        if (!companySlug) {
          this.error = 'Company Slug is missing';
          this.loading = false;
          return;
        }

        if (user.role === 'admin') {
          this.loadAdminData(companySlug);
        } else if (user.role === 'host') {
          this.loadHostData(companySlug);
        }
      });
  }

  private loadAdminData(companySlug: string): void {
    combineLatest([
      this.rentService.getAll(6, 0),
      this.rentService.getTotalCount(),
      this.vehicleService.getTotalCount(),
      this.companyService.getCompanyBySlug(companySlug)
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([rents, totalRents, totalVehicles, company]) => {
          this.activeRents = rents;
          this.totalRents = totalRents;
          this.totalVehicles = totalVehicles;
          this.company = company;
          this.totalEarnings = company.totalEarnings || 0;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load admin data';
          this.loading = false;
        }
      });
  }

  private loadHostData(companySlug: string): void {
    combineLatest([
      this.companyService.getCompanyBySlug(companySlug),
      this.rentService.getRentsByCompany(companySlug, 6, 0),
      this.rentService.getCompanyRentsCount(companySlug),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([company, rents, total]) => {
          this.company = company;
          this.activeRents = rents;
          this.totalEarnings = company.totalEarnings || 0;
          this.totalRents = total;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load host data';
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
