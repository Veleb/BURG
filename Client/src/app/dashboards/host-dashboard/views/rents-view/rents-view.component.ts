import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RentService } from '../../../../rents/rent.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RentCardComponent } from '../../../../rents/rent-card/rent-card.component';
import { RentInterface } from '../../../../../types/rent-types';
import { DatepickerComponent } from '../../../../datepicker/datepicker.component';

@Component({
  selector: 'app-rents-view',
  standalone: true,
  imports: [FormsModule, CommonModule, RentCardComponent, DatepickerComponent],
  templateUrl: './rents-view.component.html',
  styleUrls: ['./rents-view.component.css']
})
export class RentsViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  filteredRents: RentInterface[] = [];
  allRents: RentInterface[] = [];

  loading = true;
  error: string | null = null;

  currentCompanyId?: string;

  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(
    private rentService: RentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.currentCompanyId = params.get('companyId') || undefined;
      this.loadRents();
    });

    this.rentService.filteredRents$.pipe(takeUntil(this.destroy$)).subscribe(rents => {
      this.filteredRents = rents;
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadRents(): void {
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
}