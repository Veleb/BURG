import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { RentInterface } from '../../../../../../types/rent-types';
import { RentService } from '../../../../../rents/rent.service';
import { UserService } from '../../../../../user/user.service';
import { UserFromDB } from '../../../../../../types/user-types';
import { DatepickerComponent } from '../../../datepicker/datepicker.component';
import { RentCardComponent } from '../../../../../rents/rent-card/rent-card.component';

@Component({
  selector: 'app-dashboard-rents-view',
  imports: [DatepickerComponent, RentCardComponent],
  templateUrl: './dashboard-rents-view.component.html',
  styleUrl: './dashboard-rents-view.component.css'
})
export class DashboardRentsViewComponent {

  private rentService = inject(RentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  filteredRents: RentInterface[] = [];
  allRents: RentInterface[] = [];

  loading = true;
  error: string | null = null;

  currentCompanyId?: string;
  startDate: Date | null = null;
  endDate: Date | null = null;

  user: UserFromDB | null = null;

  ngOnInit(): void {
    // 1. Read user from resolver
    this.user = this.route.snapshot.data['user'];

    // 2. Fallback redirect in case resolver returns null (shouldn't happen unless redirected fails)
    if (!this.user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // 3. Combine query param changes (for companyId)
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.currentCompanyId = params.get('companyId') || undefined;
        this.loadRents();
      });

    // 4. Listen to filtered rents
    this.rentService.filteredRents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(rents => {
        this.filteredRents = rents;
      });
  }

  private loadRents() {
    this.loading = true;
    this.error = null;

    if (this.user?.role === 'host') {
      if (this.currentCompanyId) {
        this.rentService.getRentsByCompany(this.currentCompanyId).subscribe({
          next: () => this.loading = false,
          error: () => {
            this.error = 'Failed to load rents';
            this.loading = false;
          }
        });
      } else {
        this.error = 'Missing company ID';
        this.loading = false;
      }
    } else {
      this.rentService.getAll(); // triggers rents$$ update
      this.loading = false;
    }
  }

  loadCompanyRents(): void {
    if (!this.currentCompanyId) {
      this.error = 'Missing company ID';
      return;
    }

    this.loading = true;
    this.error = null;

    this.rentService.getRentsByCompany(this.currentCompanyId).subscribe({
      next: () => this.loading = false,
      error: () => {
        this.error = 'Failed to load rents';
        this.loading = false;
      }
    });
  }

  loadAllRents(): void {
    this.loading = true;
    this.error = null;

    this.rentService.getAll();
    this.loading = false;
  }


  onStartDateChange(newStartDate: Date | null): void {
    this.startDate = newStartDate;
    this.rentService.updateFilters({ startDate: newStartDate });
  }

  onEndDateChange(newEndDate: Date | null): void {
    this.endDate = newEndDate;
    this.rentService.updateFilters({ endDate: newEndDate });
  }

  onSortChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const sortKey = selectElement.value as 'price' | 'startDate' | 'endDate';
    this.rentService.setSort(sortKey, 'asc');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
