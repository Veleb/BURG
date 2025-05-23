import { AfterViewInit, Component, ElementRef, ViewChild, PLATFORM_ID, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';
import { DateOption } from 'flatpickr/dist/types/options';
import { VehicleService } from '../../../vehicle/vehicle.service';
import { ToastrService } from 'ngx-toastr';
import { RentService } from '../../../rents/rent.service';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.css'
})
export class DatepickerComponent implements AfterViewInit, OnChanges {

  private vehicleService = inject(VehicleService);
  private rentService = inject(RentService);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);

  @Input() functionality!: [string, string | null | undefined];
  // @Input() isPricePerDay = true;
  // @Input() kilometers?: number;
  @Input() vehicleId?: string;
  @Input() layoutType: string = 'default';
  @Input() startDateInput: Date | null = null;
  @Input() endDateInput: Date | null = null;

  @ViewChild('startDate') startDate!: ElementRef<HTMLInputElement>;
  @ViewChild('endDate') endDate!: ElementRef<HTMLInputElement>;

  @Output() dateSelected = new EventEmitter<{ startDate: Date | null; endDate: Date | null }>();
  @Output() startDateChange = new EventEmitter<Date | null>();
  @Output() endDateChange = new EventEmitter<Date | null>();

  startDateInstance: Instance | null = null;
  endDateInstance: Instance | null = null;

  unavailableDateRanges: { start: string; end: string }[] = [];
  unavailableDateRangesTimestamps: { start: number; end: number }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDateInput'] && this.startDateInstance) {
      this.startDateInstance.setDate(this.startDateInput as DateOption);
    }
    if (changes['endDateInput'] && this.endDateInstance) {
      this.endDateInstance.setDate(this.endDateInput as DateOption);
    }
    if (changes['vehicleId'] && this.vehicleId) {
      this.loadUnavailableDates(this.vehicleId);
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.initializeFlatpickr();

    if (this.vehicleId) {
      this.loadUnavailableDates(this.vehicleId);
    }
  }

  private initializeFlatpickr(): void {
    const commonConfig = {
      dateFormat: 'd-m-Y H:i',
      enableTime: true,
      time_24hr: true,
      minDate: new Date(),
    };

    this.startDateInstance = flatpickr(this.startDate.nativeElement, {
      ...commonConfig,
      onChange: (selectedDates) => this.handleStartDateChange(selectedDates)
    });

    this.endDateInstance = flatpickr(this.endDate.nativeElement, {
      ...commonConfig,
      onChange: (selectedDates) => this.handleEndDateChange(selectedDates)
    });
  }

  private handleStartDateChange(selectedDates: Date[]) {
    const startDate = selectedDates[0] ?? null;

    if (startDate && this.endDateInstance) {
      const maxEndDate = new Date(startDate);
      maxEndDate.setDate(maxEndDate.getDate() + 15); // Change this whether the company has an option for long term leasing

      this.endDateInstance.set('minDate', startDate);
      this.endDateInstance.set('maxDate', maxEndDate);
    }

    this.startDateChange.emit(startDate ? this.toUTCDate(startDate) : null);

    this.emitDateSelected();

    const endDate = this.endDateInstance?.selectedDates[0];

    if (endDate && startDate && (endDate < startDate || endDate > new Date(startDate.getTime() + 15 * 86400000))) {
      this.endDateInstance?.clear();
      this.endDateChange.emit(null);
      this.emitDateSelected();
    }
  }

  private handleEndDateChange(selectedDates: Date[]) {
    const endDate = selectedDates[0] ?? null;
    const startDate = this.startDateInstance?.selectedDates[0] ?? null;

    if (startDate && endDate && this.isOverlappingWithUnavailableDates(startDate, endDate)) {
      this.toastr.error(
        'Selected range overlaps with an existing rental. Please choose different dates.',
        'Overlap Error'
      );
      this.startDateInstance?.clear();
      this.endDateInstance?.clear();

      this.startDateChange.emit(null);
      this.endDateChange.emit(null);

      this.dateSelected.emit({ startDate: null, endDate: null });

      return;
    }

    if (endDate && this.startDateInstance) {
      this.startDateInstance.set('maxDate', endDate);
    }

    this.endDateChange.emit(endDate ? this.toUTCDate(endDate) : null);
    this.emitDateSelected();
  }

  private emitDateSelected() {
    const startDate = this.startDateInstance?.selectedDates[0] ?? null;
    const endDate = this.endDateInstance?.selectedDates[0] ?? null;

    this.dateSelected.emit({
      startDate: startDate ? this.toUTCDate(startDate) : null,
      endDate: endDate ? this.toUTCDate(endDate) : null
    });

  }

  private loadUnavailableDates(vehicleId: string): void {
    this.rentService.getUnavailableDates(vehicleId).subscribe({
      next: (unavailableRents) => {
        this.unavailableDateRanges = unavailableRents.map(rent => ({
          start: rent.start instanceof Date ? rent.start.toISOString() : rent.start,
          end: rent.end instanceof Date ? rent.end.toISOString() : rent.end
        }));
        this.unavailableDateRangesTimestamps = this.unavailableDateRanges.map(r => ({
          start: new Date(r.start).getTime(),
          end: new Date(r.end).getTime(),
        }));

        this.updateFlatpickrDisableDates();
      },
      error: (err) => {
        console.error('Error fetching unavailable dates:', err);
      }
    });
  }

  private updateFlatpickrDisableDates(): void {
    const disableFunc = (date: Date) => this.isDateUnavailable(date);

    this.startDateInstance?.set('disable', [disableFunc]);
    this.endDateInstance?.set('disable', [disableFunc]);
  }

  private isDateUnavailable(date: Date): boolean {
    const time = date.getTime();
    return this.unavailableDateRangesTimestamps.some(({ start, end }) => time >= start && time < end);
  }

  private isOverlappingWithUnavailableDates(start: Date, end: Date): boolean {
    const startTime = start.getTime();
    const endTime = end.getTime();
    return this.unavailableDateRangesTimestamps.some(({ start, end }) => !(endTime <= start || startTime >= end));
  }

  openCalendar(inputElement: HTMLInputElement) {
    inputElement.focus();
  }

  search(): void {
    if (!this.startDateInstance || !this.endDateInstance) {
      this.toastr.error('Date pickers are not initialized.', 'Error Occurred');
      return;
    }

    const startDateTime = this.startDateInstance.selectedDates[0];
    const endDateTime = this.endDateInstance.selectedDates[0];

    if (!startDateTime || !endDateTime) {
      this.toastr.error('Please select both start and end dates.', 'Error Occurred');
      return;
    }

    const differenceInDays = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 3600 * 24);

    if (differenceInDays > 15) {
      this.toastr.error('The maximum rental period is 15 days.', 'Error Occurred');
      return;
    } // potentially remove this

    if (this.isOverlappingWithUnavailableDates(startDateTime, endDateTime)) {
      this.toastr.error('The selected dates overlap with an existing rental. Please choose different dates.', 'Overlap Error');
      return;
    }

    this.vehicleService.updateAvailableVehicles(
      this.toUTCDate(startDateTime),
      this.toUTCDate(endDateTime)
    );
  }

  private toUTCDate(localDate: Date): Date {
    return new Date(Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      localDate.getHours(),
      localDate.getMinutes(),
      localDate.getSeconds()
    ));
  }

}