import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import flatpickr from "flatpickr";
import { Instance } from 'flatpickr/dist/types/instance';
import { VehicleService } from '../catalog/vehicle.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reserver',
  standalone: true,
  imports: [],
  templateUrl: './reserver.component.html',
  styleUrl: './reserver.component.css',
})
export class ReserverComponent implements AfterViewInit {
  @ViewChild('datepicker') datepicker!: ElementRef;
  @ViewChild('pickUpTime') pickUp!: ElementRef;
  @ViewChild('dropOffTime') dropOff!: ElementRef;

  datepickerInstance: Instance | null = null;
  pickUpInstance: Instance | null = null;
  dropOffInstance: Instance | null = null;

  constructor(private vehicleService: VehicleService, private router: Router, private toastr: ToastrService) {}

  ngAfterViewInit(): void {
    this.initializeFlatpickr();
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