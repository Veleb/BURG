import { Component, inject, OnInit } from '@angular/core';
import { ProductCardComponent } from '../vehicle/product-card/product-card.component';
import { VehicleService } from '../vehicle/vehicle.service';
import { VehicleInterface } from '../../types/vehicle-types';
import { FilterSidebarComponent } from './filter-sidebar/filter-sidebar.component';
import { SortDropdownComponent } from "../shared/components/sort-dropdown/sort-dropdown.component";
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-catalog',
    imports: [ProductCardComponent, FilterSidebarComponent, SortDropdownComponent],
    templateUrl: './catalog.component.html',
    styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {

  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);

  vehicles: VehicleInterface[] = [];
  mainCategory: string = "vehicles";
  sort: string = 'Most popular';

  startDate: Date | null = null;
  endDate: Date | null = null;

  queryCategory: string | null = null;

  currentPage: number = 1;
  pageSize: number = 20;
  totalCount: number = 0;

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.startDate = params['start'] ? new Date(params['start']) : null;
      this.endDate = params['end'] ? new Date(params['end']) : null;
      this.queryCategory = params['category'] || null;
      
      this.vehicleService.updateAvailableVehicles(this.startDate, this.endDate);
      
    })

    this.fetchVehicles();
    
    this.vehicleService.totalCount$.subscribe(count => {
      this.totalCount = count;
    });

    this.vehicleService.filteredVehicles$.subscribe(filtered => {
      this.vehicles = filtered;
    });
  }

  fetchVehicles(): void {
    const offset = (this.currentPage - 1) * this.pageSize;

    this.vehicleService.getAll({
      limit: this.pageSize,
      offset,
      sortByLikes: this.sort === 'Most popular',
      // promoted: this.mainCategory !== 'vehicles' ? true : undefined
      promoted: false,
    }).subscribe()
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.fetchVehicles();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  onSortChange(sort: string): void {
    this.sort = sort;

    switch(sort) {
      case 'Most popular':
        this.vehicleService.setSort('likes', 'desc');
        break;
      case 'Most expensive':
        this.vehicleService.setSort('price', 'desc');
        break;
      case 'Least expensive':
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
    this.vehicleService.getAll();
  }
}