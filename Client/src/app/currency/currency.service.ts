import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
   providedIn: 'root' 
})

export class CurrencyService {

  private http = inject(HttpClient)
  private cookieService = inject(CookieService)
  private platformId = inject(PLATFORM_ID)

  private rates: { [key: string]: number } = {};
  
  private rate$$ = new BehaviorSubject<number>(1);
  rate$ = this.rate$$.asObservable();

  private currency$$ = new BehaviorSubject<string>('USD');
  public currency$ = this.currency$$.asObservable();

  constructor() {
    this.initializeCurrency();
  }

  symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    INR: '₹',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
  };

  private initializeCurrency() {
    const savedCurrency = this.getCurrencyFromCookie();
    this.setCurrency(savedCurrency || 'INR');
  }

  getCurrency(): Observable<string> {
    return this.currency$;
  }

  setCurrency(currency: string) {
    this.currency$$.next(currency);
    this.saveCurrencyToCookie(currency);
    this.fetchExchangeRate(currency);
  }

  getCurrencySymbol(code: string): string {
    return this.symbols[code] || code;
  }

  private getCurrencyFromCookie(): string {
    if (isPlatformBrowser(this.platformId)) {
      return this.cookieService.get('currency') || 'INR';
    }
    return 'INR';
  }

  private saveCurrencyToCookie(currency: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.cookieService.set('currency', currency, { expires: 30, path: "/" });
    }
  }

  private fetchExchangeRate(targetCurrency: string) {
    if (!this.rates[targetCurrency]) {
      this.http.get<{ [key: string]: number }>(`/api/currency/`)
        .subscribe((data) => {
          this.rates = data;
          const rate = data[targetCurrency] ?? 1;
          this.rate$$.next(rate);
        });
    } else {
      const rate = this.rates[targetCurrency] ?? 1;
      this.rate$$.next(rate);
    }
  }


  convertPrice(price: number, targetCurrency: string): number {
    const rate = this.rates[targetCurrency];
    return rate ? price * rate : price;
  }
}
