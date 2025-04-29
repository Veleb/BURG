import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { RentInterface } from '../../../types/rent-types';
import { VehicleInterface } from '../../../types/vehicle-types';
import { DatePipe } from '../../shared/pipes/date.pipe';
import { RouterLink } from '@angular/router';
import { RentService } from '../rent.service';
import { ToastrService } from 'ngx-toastr';
import { CurrencyPipe } from '@angular/common';
import { CurrencyConverterPipe } from '../../shared/pipes/currency.pipe';
import { CurrencyService } from '../../currency/currency.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-rent-card',
  standalone: true,
  imports: [DatePipe, RouterLink, CurrencyPipe, CurrencyConverterPipe],
  templateUrl: './rent-card.component.html',
  styleUrls: ['./rent-card.component.css']
})
export class RentCardComponent implements OnInit, OnDestroy {
  
  private rentService = inject(RentService)
  private toastr = inject(ToastrService)
  private currencyService = inject(CurrencyService)

  private destroy$ = new Subject<void>();

  @Input() rent!: RentInterface;

  vehicle: VehicleInterface | null = null;
  error: string | null = null;
  selectedCurrency: string = 'USD';

  ngOnInit(): void {
    this.currencyService.getCurrency()
    .pipe(takeUntil(this.destroy$))
    .subscribe(currency => {
      this.selectedCurrency = currency;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCancel(): void {
    if (confirm(`Are you sure you want to cancel this rent?`)) {
      this.rentService.cancelRent(this.rent._id !== undefined ? this.rent._id : '').subscribe({
        next: () => {
          this.rent.status = 'canceled';
          this.toastr.success(`Successfully canceled rent!`, `Success`);
        },
        error: () => {
          this.toastr.error(`Error occurred while canceling rent!`, `Error Occurred`);
        }
      })
    }
  }
}