import { AfterViewInit, Component, ElementRef, ViewChild, PLATFORM_ID, Inject, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import flatpickr from "flatpickr";
import { Instance } from 'flatpickr/dist/types/instance';
import { VehicleService } from '../vehicle/vehicle.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-datepicker',
    imports: [  ],
    templateUrl: './datepicker.component.html',
    styleUrl: './datepicker.component.css',
})
export class DatepickerComponent implements AfterViewInit {
  @Input() functionality!: [string, string | null | undefined];
  @Input() isPricePerDay = true;
  @Input() kilometers?: number;
  @Input() vehicleId?: string;
  @Input() layoutType: string = "default"

  @ViewChild('startDate') startDate!: ElementRef;
  @ViewChild('endDate') endDate!: ElementRef;

  startDateInstance: Instance | null = null;
  endDateInstance: Instance | null = null;

  @Output() dateSelected = new EventEmitter<{ startDate: Date | null; endDate: Date | null }>();
  @Output() startDateChange = new EventEmitter<Date>();
  @Output() endDateChange = new EventEmitter<Date>();

  constructor(
    private vehicleService: VehicleService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private toastr: ToastrService,
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeFlatpickr();
    }
  }

  openCalendar(inputElement: HTMLInputElement) {
    inputElement.focus(); 
  }

  private emitDates(): void {
    const startDate = this.startDateInstance?.selectedDates[0] || null;
    const endDate = this.endDateInstance?.selectedDates[0] || null;
    this.dateSelected.emit({ startDate, endDate });
  }

  onStartDateSelect(): void {
    const selectedDate = this.startDateInstance?.selectedDates[0]
    this.startDateChange.emit(selectedDate);
  }
 
  onEndDateSelect(): void {
    const selectedDate = this.endDateInstance?.selectedDates[0];
    this.endDateChange.emit(selectedDate);
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
                    
                    const disableFrom = new Date(start.getTime() - 3 * 60 * 60 * 1000); // change buffer time

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
}