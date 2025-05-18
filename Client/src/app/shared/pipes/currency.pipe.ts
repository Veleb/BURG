import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrencyService } from '../../currency/currency.service';

@Pipe({
  name: 'currencyConverter',
  pure: false 
})
export class CurrencyConverterPipe implements PipeTransform, OnDestroy {
  
  private currencyService = inject(CurrencyService);
  private ref = inject(ChangeDetectorRef);

  private currentCurrency!: string;
  private subscription: Subscription | null = null;

  transform(price: number): string {
    if (!this.subscription) {
      this.subscription = this.currencyService.getCurrency().subscribe(currency => {
        this.currentCurrency = currency;
        
        this.ref.markForCheck();
      });
    }

    if (!this.currentCurrency) {
      return price.toString();
    }

    const convertedPrice = this.currencyService.convertPrice(price, this.currentCurrency);
    
    const locale = this.currentCurrency === 'INR' ? 'en-IN' : 'en-US';

    return convertedPrice.toLocaleString(locale, {
      style: 'currency',
      currency: this.currentCurrency,
      maximumFractionDigits: 2
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
