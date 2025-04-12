import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, Subject, switchMap, takeUntil } from 'rxjs';
import { VehicleService } from '../../vehicle/vehicle.service';
import { VehicleInterface } from '../../../types/vehicle-types';
import { DatepickerComponent } from "../../shared/components/datepicker/datepicker.component";
import { SliderComponent } from '../../shared/components/slider/slider.component';
import { ToastrService } from 'ngx-toastr';
import { CurrencyConverterPipe } from '../../shared/pipes/currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { CurrencyService } from '../../currency/currency.service';
import { LocationPickerComponent } from "../../shared/components/location-picker/location-picker.component";
import { UserService } from '../../user/user.service';
import { StripeService } from '../../services/stripe.service';
import { RentForCreate } from '../../../types/rent-types';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout'
import { ImageCarouselComponent } from '../../shared/components/image-carousel/image-carousel.component';
import { RentService } from '../../rents/rent.service';
import { UserFromDB } from '../../../types/user-types';

@Component({
  selector: 'app-details',
  imports: [
    DatepickerComponent,
    SliderComponent,
    CurrencyConverterPipe,
    CurrencyPipe,
    LocationPickerComponent,
    FormsModule,
    ImageCarouselComponent
  ],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private vehicleService = inject(VehicleService);
  private toastr = inject(ToastrService);
  private currencyService = inject(CurrencyService);
  private userService = inject(UserService);
  private rentService = inject(RentService);
  private stripeService = inject(StripeService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);

  private destroy$ = new Subject<void>();

  vehicleId: string | null = null;
  vehicle: VehicleInterface | null | undefined = undefined;

  isPricePerDay: boolean = true;
  kilometers?: number;
  rentalHours: number | undefined = undefined;
  rentalDays: number | undefined;
  
  totalPrice: number | undefined = undefined;
  totalPriceBeforeTax: number | undefined = undefined;
  gstAmount: number | undefined = undefined;                   
  totalDiscountDisplay: number | undefined = undefined;
  basePrice: number | undefined = undefined;

  selectedCurrency: string = "USD";

  currentImage: string | undefined;
  galleryOpen: boolean = false;
  
  isContactDropdownOpen = false;
  isTawkInitialized = false;

  isSameLocation: boolean = false;
  pickupLocation: string = '';
  dropoffLocation: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  referralCode: string = '';
  referralDiscount: number = 0;
  useCredits: boolean = false;
  actualCreditUsed: number = 0;

  user: UserFromDB | null = null;

  isMobile: boolean = false;

  ngOnInit(): void {
    
    this.route.paramMap.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.vehicleId = params.get('id');
        return this.vehicleId ? 
          this.vehicleService.getVehicleById(this.vehicleId).pipe(
            catchError((error) => {
              if (error.status === 400 || error.status === 404) {
                this.router.navigate(['/404']);
              }
              return of(null);
            })
          ) 
          : of(null);
      })
    ).subscribe(vehicle => {
      if (!vehicle) {
        this.router.navigate(['/404']);
        return;
      }
      this.vehicle = vehicle;
      this.calculatePrice();
    });

    this.currencyService.getCurrency().subscribe({
      next: (currency) => {
        this.selectedCurrency = currency;
      }
    });

    this.userService.user$.subscribe(user => {
      this.user = user || null;
    });

    this.breakpointObserver.observe('(max-width: 1200px)')
    .pipe(takeUntil(this.destroy$))
    .subscribe((state: BreakpointState) => {
      this.isMobile = state.matches;
    });
  }

  toggleContactDropdown() {
    this.isContactDropdownOpen = !this.isContactDropdownOpen;
  }

  pricePerDayChange(changed: boolean): void {
    this.isPricePerDay = changed;
    this.calculatePrice();
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
        this.rentalHours = undefined;
        this.totalPrice = undefined;
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
    if (!this.vehicle || !this.rentalHours) {
      this.totalPrice = undefined;
      this.totalPriceBeforeTax = undefined;
      this.gstAmount = undefined;
      return;
    }
  
    if (this.isPricePerDay) {
      this.rentalDays = Math.ceil(this.rentalHours / 24);
      this.basePrice = this.rentalDays * this.vehicle.details.pricePerDay;
    } else {
      this.basePrice = (this.kilometers || 0) * this.vehicle.details.pricePerKm;
    }

    const maxCreditUsable = Math.max(this.basePrice - this.referralDiscount, 0);
    this.actualCreditUsed = this.useCredits
    ? Math.min(this.user?.credits || 0, maxCreditUsable)
    : 0;

    const totalDiscount = this.referralDiscount + this.actualCreditUsed;
    const priceAfterDiscounts = Math.max(this.basePrice - totalDiscount, 0);
  
    const gstAmount = priceAfterDiscounts * 0.18;
    this.totalPriceBeforeTax = priceAfterDiscounts;
    this.gstAmount = Math.round(gstAmount); 
    this.totalPrice = Math.round(priceAfterDiscounts * 1.18); 
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
    if (!this.user) {
      this.toastr.error('Please log in to rent a vehicle.');
      return;
    }

    const rentalData = {
      vehicleId: this.vehicleId,
      start: this.startDate,
      end: this.endDate,
      pickupLocation: this.pickupLocation,
      dropoffLocation: this.dropoffLocation,
      isPricePerDay: this.isPricePerDay,
      kilometers: this.kilometers || 0,
      referralCode: this.referralCode || '',
      useCredits: this.useCredits || false,
      userId: this.user?._id || '',
      calculatedPrice: this.totalPrice || 0,
      appliedDiscounts: {
        creditsUsed: this.actualCreditUsed,
        referral: this.referralDiscount || 0
      }
    };

    this.stripeService.createCheckoutSession(rentalData).pipe(
      switchMap((session) => {
        return this.stripeService.redirectToCheckout(session.sessionId).then(() => 
          this.verifyPaymentAndUpdateData(session.sessionId)
        );
      }),
      catchError((error) => {
        this.toastr.error('Error initiating payment');
        return of(null);
      })
    ).subscribe({
      next: (result) => {
        if (result) {
          this.toastr.success('Payment successful and user updated.');
        }
      },
      error: () => {
      }
    });
  }

  rentVehicleWithoutPaying(): void {

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
    if (!this.user) {
      this.toastr.error('Please log in to rent a vehicle.');
      return;
    }

    const rentData: RentForCreate = {
      start: this.startDate,
      end: this.endDate,
      vehicle: this.vehicleId,
      pickupLocation: this.pickupLocation,
      dropoffLocation: this.dropoffLocation,
      user: null,
      status: "pending",
      total: this.totalPrice as number,
      referralCode: this.referralCode,
      useCredits: this.useCredits,
      calculatedPrice: 0,
      appliedDiscounts: {
        referral: 0,
        creditsUsed: 0
      }
    };

    this.rentService.rentVehicleWithoutPaying(rentData).subscribe({
      next: () => {
        this.router.navigate((['catalog']))
        this.toastr.success(`Successfully created rent without paying!`, `Success`)
      },
      error: () => this.toastr.error('Error creating rent'),
    });
  }

  onReferralCodeChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value.trim();
  
    if (!input) {
      this.referralDiscount = 0;
      this.calculatePrice();
      return;
    }
  
    this.vehicleService.isReferralValid(input).subscribe({
      next: (response) => {
        const isValid = response.valid;

        if (isValid) {
          this.referralCode = input;
          this.referralDiscount = 5;
          this.toastr.success(response.message, 'Success');
        }

        this.calculatePrice();
      },
      error: () => {
        this.referralDiscount = 0;
        this.calculatePrice();
      }
    });
  }

  private verifyPaymentAndUpdateData(sessionId: string) {
    return this.stripeService.verifyPayment(sessionId).pipe(
      switchMap((response: { status: string }) => {
        if (response.status === 'success') {
          this.toastr.error('Payment verification successful.');
          return of(null);
        } else {
          this.toastr.error('Payment verification failed.');
          return of(null); 
        }
      }),
      catchError((error) => {
        this.toastr.error('Payment verification failed.');
        return of(null);
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
