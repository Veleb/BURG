import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { RentInterface } from '../../../../../../types/rent-types';
import { RentService } from '../../../../../rents/rent.service';
import { UserFromDB } from '../../../../../../types/user-types';
import { RentCardComponent } from '../../../../../rents/rent-card/rent-card.component';
import { PaginatorComponent } from '../../../paginator/paginator.component';

@Component({
  selector: 'app-dashboard-rents-view',
  standalone: true,
  imports: [RentCardComponent, PaginatorComponent],
  templateUrl: './dashboard-rents-view.component.html',
  styleUrl: './dashboard-rents-view.component.css'
})
export class DashboardRentsViewComponent {

  private rentService = inject(RentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  filteredRents: RentInterface[] = [];
  
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  loading = true;
  error: string | null = null;

  currentCompanySlug?: string;
  startDate: Date | null = null;
  endDate: Date | null = null;
  user: UserFromDB | null = null;

  ngOnInit(): void {
    this.user = this.route.snapshot.data['user'];

    if (!this.user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.currentCompanySlug = params.get('companySlug') || undefined;
        this.loadRents(); // unified initial load
      });

    this.rentService.filteredRents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(rents => {
        this.filteredRents = rents;
      });
  }

  loadRents(): void {
    this.loading = true;
    this.error = null;

    const offset = (this.currentPage - 1) * this.pageSize;

    if (this.user?.role === 'host') {

      if (!this.currentCompanySlug) {
        this.error = 'Missing company slug';
        this.loading = false;
        return;
      }

      forkJoin([
        this.rentService.getRentsByCompany(this.currentCompanySlug, this.pageSize, offset),
        this.rentService.getCompanyRentsCount(this.currentCompanySlug)
      ]).subscribe({
        next: ([rents, count]) => {
          this.filteredRents = rents;
          this.totalCount = count;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load rents';
          this.loading = false;
        }
      });

    } else {
      forkJoin([
        this.rentService.getAll(this.pageSize, offset),
        this.rentService.getTotalCount()
      ]).subscribe({
        next: ([rents, count]) => {
          this.filteredRents = rents;
          this.totalCount = count;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load rents';
          this.loading = false;
        }
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRents(); // unified call
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
