import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { VehicleService } from '../../vehicle/vehicle.service';
import { VehicleInterface } from '../../../types/vehicle-types';
import { DatepickerComponent } from "../../datepicker/datepicker.component";
import { SliderComponent } from '../../shared/components/slider/slider.component';
import { ToastrService } from 'ngx-toastr';
import { CurrencyConverterPipe } from '../../shared/pipes/currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { CurrencyService } from '../../currency/currency.service';
import { LocationPickerComponent } from "../../shared/components/location-picker/location-picker.component";
import { UserService } from '../../user/user.service';
import { StripeService } from '../../services/stripe.service';
import { RentInterface } from '../../../types/rent-types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-details',
  imports: [
    DatepickerComponent,
    SliderComponent,
    CurrencyConverterPipe,
    CurrencyPipe,
    LocationPickerComponent,
    FormsModule
  ],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  vehicleId: string | null = null;
  vehicle: VehicleInterface | null | undefined = undefined;

  isPricePerDay: boolean = true;
  kilometers?: number;
  rentalHours: number | null = null;

  totalPrice: number | null = null;
  totalPriceBeforeTax: number | null = null;

  selectedCurrency: string = "USD";

  currentImage: string | undefined;
  galleryOpen: boolean = false;
  
  isContactDropdownOpen = false;
  private tawkApi: any;
  isTawkInitialized = false;

  isSameLocation: boolean = false;
  pickupLocation: string = '';
  dropoffLocation: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  private userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private toastr: ToastrService,
    private currencyService: CurrencyService,
    private userService: UserService,
    private stripeService: StripeService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.vehicleId = params.get('id');
        return this.vehicleId ? this.vehicleService.getVehicleById(this.vehicleId) : of(null);
      })
    ).subscribe(vehicle => {
      this.vehicle = vehicle;
      this.calculatePrice();
    });

    this.currencyService.getCurrency().subscribe({
      next: (currency) => {
        this.selectedCurrency = currency;
      }
    });

    this.userService.user$.subscribe(user => {
      this.userId = user?._id || null;
    });
  }

  toggleContactDropdown() {
    this.isContactDropdownOpen = !this.isContactDropdownOpen;
  }

  updateMainImage(image: string | undefined): void {
    this.currentImage = image;
  }

  openGallery(): void {
    this.galleryOpen = true;
  }

  closeGallery(): void {
    this.galleryOpen = false;
  }

  updateMainImageAndCloseGallery(image: string | undefined): void {
    this.updateMainImage(image);
    this.closeGallery();
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
      this.startDate = startDate;
      this.endDate = endDate;
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

  onLocationSelected(location: string, isCombined: boolean, type?: 'pickup' | 'dropoff'): void {

    if (isCombined || this.isSameLocation) {

      this.pickupLocation = location;
      this.dropoffLocation = location;

    } else if (type === 'pickup') {

      this.pickupLocation = location;

    } else if (type === 'dropoff') {

      this.dropoffLocation = location;

    }
  }

  calculatePrice(): void {
    if (!this.vehicle || this.rentalHours === null) {
      this.totalPrice = null;
      return;
    }
    if (this.isPricePerDay) {
      const pricePerHour = this.vehicle.details?.pricePerDay / 24;
      this.totalPriceBeforeTax = Number(Math.ceil((pricePerHour * this.rentalHours)).toFixed(2));
      this.totalPrice = Number(Math.ceil((pricePerHour * this.rentalHours) * 1.18).toFixed(2));
    } else {
      this.totalPriceBeforeTax = Math.ceil(Number((this.vehicle.details?.pricePerKm * (this.kilometers || 0)).toFixed(2)));
      this.totalPrice = Number(Math.ceil(this.vehicle.details?.pricePerKm * (this.kilometers || 0) * 1.18).toFixed(2));
    }
  }

  rentVehicle(): void {
    if (!this.startDate || !this.endDate) {
      this.toastr.error('Please select start and end dates.');
      return;
    }
    if (!this.pickupLocation || !this.dropoffLocation) {
      this.toastr.error('Please select a location.');
      return;
    }
    if (!this.vehicleId) {
      this.toastr.error('Vehicle not found.');
      return;
    }
    if (!this.userId) {
      this.toastr.error('Please log in to rent a vehicle.');
      return;
    }

    const rentData: RentInterface = {
      start: this.startDate,
      end: this.endDate,
      vehicle: this.vehicleId, 
      pickupLocation: this.pickupLocation,
      dropoffLocation: this.dropoffLocation,
      user: null,
      status: "pending",
    };

    const rentalType = this.isPricePerDay ? 'perDay' : 'perKm';
    const kmDriven = this.isPricePerDay ? undefined : this.kilometers;

    this.vehicleService.rentVehicle(rentData)
      .pipe(
        switchMap(rent => 
          this.stripeService.createCheckoutSession(rent._id!, rentalType, kmDriven)
        )
      )
      .subscribe({
        next: (session) => this.stripeService.redirectToCheckout(session.sessionId),
        error: () => this.toastr.error('Error initiating payment'),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
