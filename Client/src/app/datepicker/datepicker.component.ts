import { AfterViewInit, Component, ElementRef, ViewChild, PLATFORM_ID, Inject, Input  } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import flatpickr from "flatpickr";
import { Instance } from 'flatpickr/dist/types/instance';
import { VehicleService } from '../catalog/vehicle.service';
import { UppercasePipe } from '../shared/pipes/uppercase.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [ UppercasePipe ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.css',
})
export class DatepickerComponent implements AfterViewInit {
  @Input() functionality!: [string, string | null | undefined];

  @ViewChild('datepicker') datepicker!: ElementRef;
  @ViewChild('pickUpTime') pickUp!: ElementRef;
  @ViewChild('dropOffTime') dropOff!: ElementRef;

  datepickerInstance: Instance | null = null;
  pickUpInstance: Instance | null = null;
  dropOffInstance: Instance | null = null;

  constructor(private vehicleService: VehicleService, @Inject(PLATFORM_ID) private platformId: Object, private toastr: ToastrService) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeFlatpickr();
    }
  }

  initializeFlatpickr(): void {
    this.datepickerInstance = flatpickr(this.datepicker.nativeElement, {
      mode: "range",
      minDate: "today",
      dateFormat: "Y-m-d",
    });

    this.pickUpInstance = flatpickr(this.pickUp.nativeElement, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true
    });

    this.dropOffInstance = flatpickr(this.dropOff.nativeElement, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true
    });
  }

  invokeFunctionality(...args: any[]): void {
    if (this.functionality && typeof (this as any)[this.functionality[0]] === 'function') {
      const methodName = this.functionality[0];
      const methodArgs = [this.functionality[1], ...args];
      ((this as any)[methodName] as Function).apply(this, methodArgs);
    } else {
      console.error(`Function "${this.functionality[0]}" not found or not callable.`);
    }
  }
  

  search(): void {
    const dateRange = this.datepickerInstance?.selectedDates;
    const pickUpTime = this.pickUpInstance?.selectedDates[0];
    const dropOffTime = this.dropOffInstance?.selectedDates[0];
 
    if (dateRange && pickUpTime && dropOffTime) {
      const [startDate, endDate] = dateRange;
      const startDateTime = this.formatDateTime(startDate, pickUpTime);
      const endDateTime = this.formatDateTime(endDate, dropOffTime);
    
      this.vehicleService.updateAvailableVehicles(startDateTime, endDateTime);

    }
  }

  rent(vehicleId: string): void {
    const dateRange = this.datepickerInstance?.selectedDates;
    const pickUpTime = this.pickUpInstance?.selectedDates[0];
    const dropOffTime = this.dropOffInstance?.selectedDates[0];
  
    if (dateRange && pickUpTime && dropOffTime) {
      const [startDate, endDate] = dateRange;
      const startDateTime = this.formatDateTime(startDate, pickUpTime);
      const endDateTime = this.formatDateTime(endDate, dropOffTime);
  
      this.vehicleService.rentVehicle(vehicleId, startDateTime, endDateTime).subscribe({
        next: () => {
          // TODO: NAVIGATE TO THE STRIPE CHECKOUT PAGE WITH THE RENT DETAILS
          this.toastr.success('Successful rent', `Success`);
        },
        error: (err) => {
          this.toastr.error('Error renting vehicle', `Error Occurred!`);
        }
      });
    }
  }

  formatDateTime(date: Date, time: Date): Date {
    return new Date(
      date.getFullYear(), 
      date.getMonth(), 
      date.getDate(), 
      time.getHours(), 
      time.getMinutes()
    );
  }
}