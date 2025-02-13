import { Component, signal, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-slider',
    imports: [],
    templateUrl: './slider.component.html',
    styleUrl: './slider.component.css'
})
export class SliderComponent {
  isPricePerDay = signal<boolean>(true);
  
  @Output() pricePerDayChanged = new EventEmitter<boolean>();

  onToggleChange() {
    const newValue = !this.isPricePerDay();
    this.isPricePerDay.set(newValue); 
    this.pricePerDayChanged.emit(newValue);
  }
}
