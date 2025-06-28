import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProductCardComponent } from '../vehicle/product-card/product-card.component';
import { VehicleService } from '../vehicle/vehicle.service';
import { VehicleInterface } from '../../types/vehicle-types';
import { FilterSidebarComponent } from './filter-sidebar/filter-sidebar.component';
import { SortDropdownComponent } from "../shared/components/sort-dropdown/sort-dropdown.component";
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { PaginatorComponent } from '../shared/components/paginator/paginator.component';

@Component({
    selector: 'app-catalog',
    imports: [ProductCardComponent, FilterSidebarComponent, SortDropdownComponent, PaginatorComponent],
    templateUrl: './catalog.component.html',
    styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit, OnDestroy {

  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  vehicles: VehicleInterface[] = [];
  mainCategory: string = "vehicles";
  sort: string = 'Most popular';

  startDate: Date | null = null;
  endDate: Date | null = null;
  queryCategory: string | null = null;

  currentPage: number = 1;
  pageSize: number = 20;
  totalCount: number = 0;

  // currency: string = "INR";
  // currencySymbol: string = "";

  ngOnInit(): void {

    this.route.queryParams
    .pipe(takeUntil(this.destroy$))
    .subscribe(params => {
      this.startDate = params['start'] ? new Date(params['start']) : null;
      this.endDate = params['end'] ? new Date(params['end']) : null;
      this.queryCategory = params['category'] || null;
      
      this.vehicleService.updateAvailableVehicles(this.startDate, this.endDate);
      
       this.currentPage = 1;
       this.fetchVehicles();
    })

    this.fetchVehicles();
    
    this.vehicleService.totalCount$
    .pipe(takeUntil(this.destroy$))
    .subscribe(count => {
      this.totalCount = count;
    });

    this.vehicleService.filteredVehicles$
    .pipe(takeUntil(this.destroy$))
    .subscribe(filtered => {
      this.vehicles = filtered;
    });

    // this.currencyService.getCurrency()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (currency: string) => {
    //       this.currency = currency;
    //       this.currencySymbol = this.currencyService.getCurrencySymbol(currency);
    //     },
    //   });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchVehicles(): void {
    const offset = (this.currentPage - 1) * this.pageSize;

    forkJoin([
    this.vehicleService.getAll({ limit: this.pageSize, offset }),
    this.vehicleService.getTotalCount()
  ]).subscribe({
    next: ([vehiclesResponse, totalCount]) => {
      this.totalCount = totalCount;
      
    },
    error: err => console.error('Fetch error', err)
  });
  }

  onPageChange(newPage: number): void {

    if (newPage < 1) {
      newPage = 1;
    } else if (newPage > this.totalPages) {
      newPage = this.totalPages;
    }

    if (newPage === this.currentPage) return;

    this.currentPage = newPage;
    this.fetchVehicles();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  onSortChange(sort: string): void {
    this.sort = sort;
    //  this.currentPage = 1;

    switch(sort) {
      case 'Most popular':
        this.vehicleService.setSort('likes', 'desc');
        break;
      case 'Price high':
        this.vehicleService.setSort('price', 'desc');
        break;
      case 'Price low':
        this.vehicleService.setSort('price', 'asc');
        break;
      case 'Year new-old':
        this.vehicleService.setSort('year', 'desc');
        break;
      case 'Year old-new':
        this.vehicleService.setSort('year', 'asc');
        break;
      default:
        this.vehicleService.setSort('none', 'asc');
    }

    this.fetchVehicles();
  }

  onChangeMainCategory(mainCategory: string): void {
    this.mainCategory = mainCategory;
    this.currentPage = 1;
    this.fetchVehicles();
  }
}