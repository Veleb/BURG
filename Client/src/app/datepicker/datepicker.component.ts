import { AfterViewInit, Component, ElementRef, ViewChild, PLATFORM_ID, Inject, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import flatpickr from "flatpickr";
import { Instance } from 'flatpickr/dist/types/instance';
import { VehicleService } from '../vehicle/vehicle.service';
import { UppercasePipe } from '../shared/pipes/uppercase.pipe';
import { ToastrService } from 'ngx-toastr';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { switchMap } from 'rxjs/operators'; 

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [UppercasePipe],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class DatepickerComponent implements AfterViewInit {
  @Input() functionality!: [string, string | null | undefined];
  @Input() isPricePerDay = true;
  @Input() kilometers?: number;
  @Input() vehicleId?: string;

  @ViewChild('startDate') startDate!: ElementRef;
  @ViewChild('endDate') endDate!: ElementRef;

  startDateInstance: Instance | null = null;
  endDateInstance: Instance | null = null;

  @Output() dateSelected = new EventEmitter<{ startDate: Date | null; endDate: Date | null }>();

  constructor(
    private vehicleService: VehicleService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private toastr: ToastrService
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeFlatpickr();
    }
  }

  private emitDates(): void {
    const startDate = this.startDateInstance?.selectedDates[0] || null;
    const endDate = this.endDateInstance?.selectedDates[0] || null;
    this.dateSelected.emit({ startDate, endDate });
  }

  private initializeFlatpickr(): void {
    const commonConfig = {
      dateFormat: 'd-m-Y H:i',
      enableTime: true,
      time_24hr: true,
      minDate: new Date(),
      onOpen: (selectedDates: Date[], dateStr: string, instance: Instance) => {
        if (this.vehicleId) {
          this.vehicleService.getUnavailableDates(this.vehicleId).subscribe({
            next: (unavailableDates) => {
              
              const disableFunction = (date: Date) => {
                const now = new Date();
  
                for (const rental of unavailableDates) {
                  const start = new Date(rental.start);
                  const end = new Date(rental.end);
  
                  if (date >= start && date <= end) {
                    return true;
                  }
  
                  if (date.toDateString() === start.toDateString()) {
                    
                    const disableFrom = new Date(start.getTime() - 30  * 60 * 1000); // change buffer time
  
                    if (date >= disableFrom && date <= end) {
                      return true;
                    }
  
                    if (now.toDateString() === start.toDateString() && now >= disableFrom) {
                      return true;
                    }
                  }
                }
                return false;
              };
  
              instance.set('disable', [disableFunction]);
            },
            error: (err) =>
              console.error('Error fetching unavailable dates:', err),
          });
        }
      },
    };
  
    this.startDateInstance = flatpickr(this.startDate.nativeElement, {
      ...commonConfig,
      onChange: (selectedDates) => {
        if (selectedDates[0]) {
          this.endDateInstance?.set('minDate', selectedDates[0]);
        }
        this.emitDates();
      },
    });
  
    this.endDateInstance = flatpickr(this.endDate.nativeElement, {
      ...commonConfig,
      onChange: (selectedDates) => {
        if (selectedDates[0]) {
          this.startDateInstance?.set('maxDate', selectedDates[0]);
        }
        this.emitDates();
      },
    });
  }
  

  async redirectToStripe(sessionId: string): Promise<void> {
    const stripe = await loadStripe(environment.publishable_key);
    if (!stripe) {
      this.toastr.error('Failed to initialize payment processor');
      return;
    }
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) this.toastr.error(error.message || 'Payment processing failed');
  }

  invokeFunctionality(...args: any[]): void {
    if (!this.functionality?.[0]) {
      console.error('No functionality specified');
      return;
    }
    
    const methodName = this.functionality[0];
    const method = (this as any)[methodName];
    
    if (typeof method !== 'function') {
      console.error(`Function "${methodName}" not found or not callable.`);
      return;
    }

    const methodArgs = this.functionality[1] !== undefined ? [this.functionality[1], ...args] : args;
    method.apply(this, methodArgs);
  }

  search(): void {
    const startDateTime = this.startDateInstance?.selectedDates[0];
    const endDateTime = this.endDateInstance?.selectedDates[0];

    if (!startDateTime || !endDateTime) {
      this.toastr.error('Please select both start and end dates.');
      return;
    }

    const currentDate = new Date();
    if (startDateTime < currentDate) {
      this.toastr.error('Start date cannot be in the past.');
      return;
    }
    if (endDateTime < currentDate) {
      this.toastr.error('End date cannot be in the past.');
      return;
    }
    if (startDateTime >= endDateTime) {
      this.toastr.error('Start date must be before end date.');
      return;
    }

    this.vehicleService.updateAvailableVehicles(startDateTime, endDateTime);
  }

  rent(vehicleId: string): void {
    const startDateTime = this.startDateInstance?.selectedDates[0];
    const endDateTime = this.endDateInstance?.selectedDates[0];

    if (!startDateTime || !endDateTime) {
      this.toastr.error('Please select both start and end dates.');
      return;
    }

    const currentDate = new Date();
    if (startDateTime < currentDate || endDateTime < currentDate) {
      this.toastr.error('Dates cannot be in the past.');
      return;
    }
    if (startDateTime >= endDateTime) {
      this.toastr.error('Start date must be before end date.');
      return;
    }

    const rentalType = this.isPricePerDay ? 'perDay' : 'perKm';
    const kmDriven = this.isPricePerDay ? undefined : this.kilometers;

    this.vehicleService.rentVehicle(vehicleId, startDateTime, endDateTime)
    .pipe(
      switchMap(rentData => 
        this.vehicleService.createCheckoutSession(rentData._id, rentalType, kmDriven)
      )
    )
    .subscribe({
      next: (session) => this.redirectToStripe(session.sessionId),
      error: () => this.toastr.error('Error initiating payment')
    });
    
  }
}