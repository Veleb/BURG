import { AfterViewInit, Component, ElementRef, ViewChild, PLATFORM_ID, Inject, Input  } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import flatpickr from "flatpickr";
import { Instance } from 'flatpickr/dist/types/instance';
import { VehicleService } from '../catalog/vehicle.service';
import { UppercasePipe } from '../shared/pipes/uppercase.pipe';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [ UppercasePipe ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.css',
})
export class DatepickerComponent implements AfterViewInit {
  @Input() functionality!: string

  @ViewChild('datepicker') datepicker!: ElementRef;
  @ViewChild('pickUpTime') pickUp!: ElementRef;
  @ViewChild('dropOffTime') dropOff!: ElementRef;

  datepickerInstance: Instance | null = null;
  pickUpInstance: Instance | null = null;
  dropOffInstance: Instance | null = null;

  constructor(private vehicleService: VehicleService, @Inject(PLATFORM_ID) private platformId: Object) {}

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

  invokeFunctionality(): void {
    if (this.functionality && typeof (this as any)[this.functionality] === 'function') {
      ((this as any)[this.functionality] as Function).call(this);
    } else {
      console.error(`Function "${this.functionality}" not found or not callable.`);
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

  rent(): void {
    // TODO: MAKE LOGIC FOR RENT WITH VALIDATION!
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