import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

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
    this.userService.getProfile().subscribe();
    
        combineLatest([this.userService.user$, this.route.queryParamMap])
          .pipe(takeUntil(this.destroy$))
          .subscribe(([user, params]) => {
            this.user = user;
            this.currentCompanyId = params.get('companyId') || undefined;

            if (user) {
              user.role === 'host' ? this.loadCompanyRents() : this.loadAllRents();
            } else {
              this.error = 'User not logged in';
              this.loading = false;
            }

          });

    this.rentService.filteredRents$.pipe(takeUntil(this.destroy$)).subscribe(rents => {
      this.filteredRents = rents;
      this.loading = false;
    });
  }

  loadCompanyRents(): void {
    if (!this.currentCompanyId) return;
  
    this.loading = true;
    this.error = null;
  
    this.rentService.getRentsByCompany(this.currentCompanyId).subscribe({
      next: () => this.loading = false,
      error: (err) => {
        this.error = 'Failed to load rents';
        this.loading = false;
      }
    });
  }

  loadAllRents(): void {
    this.loading = true;
    this.error = null;
  
    this.rentService.rents$.subscribe({
      next: () => this.loading = false,
      error: (err) => {
        this.error = 'Failed to load rents';
        this.loading = false;
      }
    });
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
