import { Component, OnInit } from '@angular/core';
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

  vehicles: VehicleInterface[] = [];
  mainCategory: string = "vehicles";
  sort: string = 'Most popular';

  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(
    private vehicleService: VehicleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.startDate = params['start'] ? new Date(params['start']) : null;
      this.endDate = params['end'] ? new Date(params['end']) : null;
      
      this.vehicleService.updateAvailableVehicles(this.startDate, this.endDate);
    })

    this.vehicleService.getAll();
    
    this.vehicleService.filteredVehicles$.subscribe(filtered => {
      this.vehicles = filtered;
    });
  }

  onSortChange(sort: string): void {
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
  }

  onChangeMainCategory(mainCategory: string): void {
    this.mainCategory = mainCategory;
    this.vehicleService.getAll();
  }
}