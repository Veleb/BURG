import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, forkJoin, Subject, take, takeUntil } from 'rxjs';
import { RentInterface } from '../../../../../../types/rent-types';
import { RentService } from '../../../../../rents/rent.service';
import { UserService } from '../../../../../user/user.service';
import { UserFromDB } from '../../../../../../types/user-types';
import { DatepickerComponent } from '../../../datepicker/datepicker.component';
import { RentCardComponent } from '../../../../../rents/rent-card/rent-card.component';
import { PaginatorComponent } from '../../../paginator/paginator.component';

@Component({
  selector: 'app-dashboard-rents-view',
  imports: [DatepickerComponent, RentCardComponent, PaginatorComponent],
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

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  loading = true;
  error: string | null = null;

  currentCompanyId?: string;
  startDate: Date | null = null;
  endDate: Date | null = null;

  user: UserFromDB | null = null;

  ngOnInit(): void {
  this.user = this.route.snapshot.data['user'];

  if (!this.user) {
    this.router.navigate(['/auth/login']);
    return;
  }

  // Trigger load when query params change
  this.route.queryParamMap
    .pipe(takeUntil(this.destroy$))
    .subscribe(params => {
      this.currentCompanyId = params.get('companyId') || undefined;

      if (this.user) {
        if (this.user.role === 'host') {
          this.loadCompanyRents();
        } else {
          this.loadAllRents();
        }
      } else {
        this.error = 'User not logged in';
        this.loading = false;
      }
    });

  // Subscribe to filteredRents$ independently (no loading calls here)
  this.rentService.filteredRents$
    .pipe(takeUntil(this.destroy$))
    .subscribe(rents => {
      this.filteredRents = rents;
      console.log(rents);  // will only log when filteredRents$ emits, no feedback loop
    });
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

    const offset = (this.currentPage - 1) * this.pageSize;

    forkJoin([
      this.rentService.getAll(this.pageSize, offset),
      this.rentService.getTotalCount()
    ]).subscribe({
      next: ([rents, count]) => {
        this.filteredRents = rents;
        this.totalCount = count;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load rents';
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAllRents();
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
