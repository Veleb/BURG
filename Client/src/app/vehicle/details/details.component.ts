import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VehicleService } from '../../vehicle/vehicle.service';
import { VehicleInterface } from '../../../types/vehicle-types';
import { DatepickerComponent } from "../../datepicker/datepicker.component";
import { SliderComponent } from '../../shared/slider/slider.component';
import { ToastrService } from 'ngx-toastr';
import { CurrencyConverterPipe } from '../../shared/pipes/currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { CurrencyService } from '../../currency/currency.service';
import { LocationPickerComponent } from "../../shared/location-picker/location-picker.component";

@Component({
    selector: 'app-details',
    imports: [DatepickerComponent, SliderComponent, CurrencyConverterPipe, CurrencyPipe, LocationPickerComponent, LocationPickerComponent],
    templateUrl: './details.component.html',
    styleUrl: './details.component.css'
})
export class DetailsComponent implements OnInit {

  vehicleId: string | null = null;
  vehicle: VehicleInterface | undefined = undefined;

  isPricePerDay: boolean = true;
  kilometers?: number;

  rentalHours: number | null = null;
  totalPrice: number | null = null;
  totalPriceBeforeTax: number | null = null;

  selectedCurrency: string = "USD";

  currentImage: string | undefined;

  constructor(private route: ActivatedRoute, private vehicleService: VehicleService, private toastr: ToastrService, private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.vehicleId = params.get('id');

      if (this.vehicleId) {
        this.vehicleService.getVehicleById(this.vehicleId).subscribe(vehicle => {
          this.vehicle = vehicle; 
          this.calculatePrice();
        });
      }
    });

    this.currencyService.getCurrency().subscribe({
      next: (currency) => {
        this.selectedCurrency = currency;
      }
    })
  }
 
  updateMainImage(image: string | undefined): void {
    this.currentImage = image;
  }

  onPricePerDayChanged(newValue: boolean): void {
    this.isPricePerDay = newValue;
    this.calculatePrice();
  }

  onKilometersInput(event: Event): void {
    this.kilometers = Number((event.target as HTMLInputElement).value);
    this.calculatePrice();
  }

  onDateSelection(startDate: Date | null, endDate: Date | null): void {
    if (startDate && endDate) {
      const timeDiff = endDate.getTime() - startDate.getTime();

      if (timeDiff <= 0) {
        this.toastr.warning("End date must be after start date!", "Warning");
        this.rentalHours = null;
        this.totalPrice = null;
        return;
      }

      this.rentalHours = timeDiff / (1000 * 60 * 60); 
      this.calculatePrice();
    }
  }

  calculatePrice(): void {
    if (!this.vehicle || this.rentalHours === null) {
      this.totalPrice = null;
      return;
    }
  
    if (this.isPricePerDay) {
      const pricePerHour = this.vehicle.pricePerDay / 24;
      this.totalPriceBeforeTax = Number(Math.ceil( (pricePerHour * this.rentalHours)).toFixed(2)); 
      this.totalPrice = Number(Math.ceil( (pricePerHour * this.rentalHours) * 1.18).toFixed(2)); 
    } else {
      this.totalPriceBeforeTax = Number(Math.ceil((this.vehicle.pricePerKm * (this.kilometers || 0))).toFixed(2));
      this.totalPrice = Number(Math.ceil((this.vehicle.pricePerKm * (this.kilometers || 0) * 1.18)).toFixed(2));
    }
  }
  
}
