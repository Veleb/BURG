import { Component, Output, EventEmitter } from '@angular/core';
import { VehicleInterface } from '../../../../types/vehicle-types';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { VehicleService } from '../../../vehicle/vehicle.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [ FormsModule ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  @Output() selectedVehicle = new EventEmitter<VehicleInterface>();
  searchTerm: string = '';
  suggestions: VehicleInterface[] = [];
  showDropdown: boolean = false;
  activeIndex: number = -1;

  private searchTerm$ = new Subject<string>();

  constructor(private vehicleService: VehicleService) {
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.vehicleService.filteredVehicles$.pipe(
        map(vehicles => this.filterVehicles(term as string, vehicles))
      ))
    ).subscribe({
      next: (filtered) => {
        this.suggestions = filtered;
        this.showDropdown = filtered.length > 0;
        this.activeIndex = -1;
      }
    });
  }

  private filterVehicles(term: string, vehicles: VehicleInterface[]): VehicleInterface[] {
    if (!term) return [];
    const lowerTerm = term.toLowerCase();
    return vehicles.filter(vehicle => 
      vehicle.details.name.toLowerCase().includes(lowerTerm) ||
      vehicle.details.model.toLowerCase().includes(lowerTerm) ||
      vehicle.details.year.toString().includes(term) ||
      vehicle.details.category.toLowerCase().includes(lowerTerm)
    );
  }

  onSearchInput(): void {
    this.searchTerm$.next(this.searchTerm);
  }

  selectVehicle(vehicle: VehicleInterface): void {
    this.selectedVehicle.emit(vehicle);
    this.searchTerm = `${vehicle.details.name} ${vehicle.details.model}`;
    this.showDropdown = false;
  }

}