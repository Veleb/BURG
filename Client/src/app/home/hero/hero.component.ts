import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatepickerComponent } from '../../datepicker/datepicker.component';

@Component({
    selector: 'app-hero',
    imports: [DatepickerComponent],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css'
})

export class HeroComponent {
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(
    private router: Router,

  ) {}

  onStartDateChange(newStartDate: Date | null): void {
    this.startDate = newStartDate;
  }
  
  onEndDateChange(newEndDate: Date | null): void {
    this.endDate = newEndDate;
  }

  onSearch(): void {

    this.router.navigate(['/catalog'], {
      queryParams: {
        start: this.startDate?.toISOString(),
        end: this.endDate?.toISOString()
      }
    });
  }

}
