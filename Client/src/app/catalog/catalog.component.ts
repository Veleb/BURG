import { Component, OnInit } from '@angular/core';
import { ProductCardComponent } from '../vehicle/product-card/product-card.component';
import { VehicleService } from '../vehicle/vehicle.service';
import { VehicleInterface } from '../../types/vehicle-types';
import { environment } from '../../environments/environment';
// import { UppercasePipe } from '../shared/pipes/uppercase.pipe';
import { DatepickerComponent } from "../datepicker/datepicker.component";
import { FilterSidebarComponent } from './filter-sidebar/filter-sidebar.component';
import { LocationPickerComponent } from '../shared/location-picker/location-picker.component';

@Component({
    selector: 'app-catalog',
    imports: [ProductCardComponent, DatepickerComponent, FilterSidebarComponent, LocationPickerComponent],
    templateUrl: './catalog.component.html',
    styleUrl: './catalog.component.css'
})

export class CatalogComponent implements OnInit {

  vehicles: VehicleInterface[] = [];
  allVehicles: VehicleInterface[] = [];
  categories: string[] = environment.categories;

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.vehicleService.getAll();
    this.vehicleService.vehicles$.subscribe((vehicles) => {
      this.vehicles = vehicles;
      this.allVehicles = vehicles;
    });

    this.vehicleService.availableVehicles$.subscribe((availableVehicles) => {
      this.vehicles = availableVehicles; 
    });
  }

  activateCategory(category: string): void {
    if (category === 'all') {
      this.vehicles = this.allVehicles;
    }
    else if (category) {
      this.vehicles = this.allVehicles.filter(
        (vehicle) => vehicle.category === category
      );
    } else {
      this.vehicles = this.allVehicles; 
    }
  }
}