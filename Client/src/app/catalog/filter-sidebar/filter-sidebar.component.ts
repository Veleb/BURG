import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { DatepickerComponent } from "../../datepicker/datepicker.component";
import { VehicleService } from '../../vehicle/vehicle.service';
import { environment } from '../../../environments/environment';
import { UppercasePipe } from '../../shared/pipes/uppercase.pipe';
import { Category } from '../../../types/enums';

@Component({
  selector: 'app-filter-sidebar',
  imports: [DatepickerComponent, UppercasePipe],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.css'
})
export class FilterSidebarComponent implements OnChanges {
  @Input() mainCategory!: string;
  @Input() startDate: Date | null = null;
  @Input() endDate: Date | null = null;
  @Input() queryCategory: string | null = null;

  @ViewChild('datepicker') datepicker!: DatepickerComponent;

  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;

  categories: Category[] = environment.categories;
  activeCategories: string[] = [];

  constructor(private vehicleService: VehicleService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['startDate'] || changes['endDate']) {
      if (this.datepicker) { 
        this.datepicker.startDate.nativeElement.value = this.startDate;
        this.datepicker.endDate.nativeElement.value = this.endDate;
      }
      this.vehicleService.updateAvailableVehicles(this.startDate, this.endDate);
    }

    if (changes['queryCategory']) {
      this.activeCategories = this.queryCategory ? [this.queryCategory] : [];

      this.vehicleService.setCategories(this.activeCategories);
    }
  }

  toggleCategory(category: string) {
    const index = this.activeCategories.indexOf(category);
    if (index === -1) {
      this.activeCategories.push(category);
    } else {
      this.activeCategories.splice(index, 1);
    }
    this.vehicleService.setCategories(this.activeCategories);
  }

  onStartDateChange(newStartDate: Date | null): void {
    this.startDateFilter = newStartDate;
    this.vehicleService.updateAvailableVehicles(this.startDateFilter, this.endDateFilter);
  }
  
  onEndDateChange(newEndDate: Date | null): void {
    this.endDateFilter = newEndDate;
    this.vehicleService.updateAvailableVehicles(this.startDateFilter, this.endDateFilter);
  }
}
