import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VehicleService } from '../../vehicle/vehicle.service';
import { VehicleInterface } from '../../../types/vehicle-types';
import { DetailsCardComponent } from './details-card/details-card.component';
import { DatepickerComponent } from "../../datepicker/datepicker.component";
import { SliderComponent } from '../../shared/slider/slider.component';


@Component({
  selector: 'app-details',
  standalone: true,
  imports: [DetailsCardComponent, DatepickerComponent, SliderComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent implements OnInit {

  vehicleId: string | null = null;
  vehicle: VehicleInterface | undefined = undefined;
  isPricePerDay: boolean = true;
  kilometers?: number;

  constructor( private route: ActivatedRoute, private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {

      this.vehicleId = params.get('id'); 

      if (this.vehicleId) {
        
        this.vehicleService.getVehicleById(this.vehicleId).subscribe(vehicle => {
          this.vehicle = vehicle; 
        });
      }
    });
  }

  onPricePerDayChanged(newValue: boolean): void {
    this.isPricePerDay = newValue;
  }

  onKilometersInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.kilometers = Number(value);
  }
  
}
