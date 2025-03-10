import { Component, OnInit } from '@angular/core';
import { HeroComponent } from "./hero/hero.component";
import { VehicleService } from '../vehicle/vehicle.service';
import { VehicleInterface } from '../../types/vehicle-types';
import { environment } from '../../environments/environment';
import { UppercasePipe } from '../shared/pipes/uppercase.pipe';
import { Category } from '../../types/enums';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-home',
    imports: [HeroComponent, UppercasePipe, RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

    vehicles: VehicleInterface[] | undefined = undefined;
    categories: Category[] = environment.categories;

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
