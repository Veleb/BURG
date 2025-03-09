import { Component, OnInit } from '@angular/core';
import { HeroComponent } from "./hero/hero.component";
import { ProductCardComponent } from '../vehicle/product-card/product-card.component';
import { VehicleService } from '../vehicle/vehicle.service';
import { VehicleInterface } from '../../types/vehicle-types';

@Component({
    selector: 'app-home',
    imports: [HeroComponent, ProductCardComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

    vehicles: VehicleInterface[] | undefined = undefined;

    constructor(
        private vehicleService: VehicleService,
        
    ) {}

    ngOnInit(): void {
        this.vehicleService.getAll()

        this.vehicleService.vehicles$.subscribe(vehicles => {
            this.vehicles = vehicles.slice(0, 3);
        });
    }

}
