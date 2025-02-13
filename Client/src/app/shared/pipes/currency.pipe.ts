import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrencyService } from '../../currency/currency.service';

@Pipe({
  name: 'currencyConverter',
  pure: false 
})
export class CurrencyConverterPipe implements PipeTransform, OnDestroy {
  private currentCurrency!: string;
  private subscription: Subscription | null = null;

  constructor(
    private currencyService: CurrencyService,
    private ref: ChangeDetectorRef
  ) {}

  transform(price: number): number {
    if (!this.subscription) {
      this.subscription = this.currencyService.getCurrency().subscribe(currency => {
        this.currentCurrency = currency;
        
        this.ref.markForCheck();
      });
    }

    if (!this.currentCurrency) {
      return price;
    }

    const convertedPrice = this.currencyService.convertPrice(price, this.currentCurrency);
    return Number(convertedPrice.toFixed(2));
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
