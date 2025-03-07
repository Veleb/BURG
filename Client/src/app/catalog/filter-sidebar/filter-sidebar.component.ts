import { Component, Input, OnChanges } from '@angular/core';
import { DatepickerComponent } from "../../datepicker/datepicker.component";
import { VehicleService } from '../../vehicle/vehicle.service';
import { environment } from '../../../environments/environment';
import { UppercasePipe } from '../../shared/pipes/uppercase.pipe';

@Component({
  selector: 'app-filter-sidebar',
  imports: [DatepickerComponent, UppercasePipe],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.css'
})
export class FilterSidebarComponent implements OnChanges {
  @Input() mainCategory!: string;

  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;

  categories: string[] = environment.categories;
  activeCategories: string[] = []; 
  
  ngOnChanges() { // we reset all of the categories when the main category is changed
    this.activeCategories = [];
    this.vehicleService.setCategories(this.activeCategories);
  }

  constructor(private vehicleService: VehicleService) {}
  
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
