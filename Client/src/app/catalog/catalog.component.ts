import { Component, OnInit } from '@angular/core';
import { ProductCardComponent } from './product-card/product-card.component';
import { VehicleService } from './vehicle.service';
import { VehicleInterface } from '../../types/vehicle-types';
import { environment } from '../../environments/environment';
import { UppercasePipe } from '../shared/pipes/uppercase.pipe';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ ProductCardComponent, UppercasePipe ],
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
