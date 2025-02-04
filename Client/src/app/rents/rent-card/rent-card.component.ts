import { Component, Input, OnInit } from '@angular/core';
import { RentInterface } from '../../../types/rent-types';
import { VehicleInterface } from '../../../types/vehicle-types';
import { VehicleService } from '../../vehicle/vehicle.service';
import { RentService } from '../rent.service';
import { switchMap } from 'rxjs';
import { DatePipe } from '../../shared/pipes/date.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rent-card',
  standalone: true,
  imports: [ DatePipe, RouterLink ],
  templateUrl: './rent-card.component.html',
  styleUrl: './rent-card.component.css'
})
export class RentCardComponent implements OnInit {
  @Input() rentId!: string;

  constructor( private vehicleService: VehicleService, private rentService: RentService) {}

  vehicle: VehicleInterface | null = null;
  rent: RentInterface | null = null;

  dateRange: number | null = null;

  ngOnInit(): void {
    this.rentService.getRentById(this.rentId).pipe(
      switchMap(rent => {
        if (!rent) {
          throw new Error('Rent not found');
        }
        
        this.rent = rent;
      
        return this.vehicleService.getVehicleById(rent.vehicle._id);
      })
    ).subscribe({
      next: (vehicle) => {
        this.vehicle = vehicle;
      }
    });


  }

  // private calculateDateRange(rent: RentInterface): void {

  //   if (this.rent!.start && this.rent!.end) {
  //     this.dateRange = this.rent!.end.getTime() - this.rent!.start.getTime();
  //   } else {
  //     console.warn('Invalid dates for rent:', this.rent);
  //   }

  // }

}
