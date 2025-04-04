import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
   providedIn: 'root' 
})

export class CurrencyService {
  private rates: { [key: string]: number } = {};
  
  private currency$$ = new BehaviorSubject<string>('USD');
  public currency$ = this.currency$$.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeCurrency();
  }

  private initializeCurrency() {
    const savedCurrency = this.getCurrencyFromCookie();
    this.setCurrency(savedCurrency || 'USD');
  }

  getCurrency(): Observable<string> {
    return this.currency$;
  }

  setCurrency(currency: string) {
    this.currency$$.next(currency);
    this.saveCurrencyToCookie(currency);
    this.fetchExchangeRate(currency);
  }

  private getCurrencyFromCookie(): string {
    if (isPlatformBrowser(this.platformId)) {
      return this.cookieService.get('currency') || 'USD';
    }
    return 'USD';
  }

  private saveCurrencyToCookie(currency: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.cookieService.set('currency', currency, { expires: 30 });
    }
  }

  private fetchExchangeRate(targetCurrency: string) {
    if (!this.rates[targetCurrency]) {
      // this.http.get(`/api/currency/`)
      //   .subscribe((data: any) => {
      //     this.rates = data;
      //   });
    }
  }

  convertPrice(price: number, targetCurrency: string): number {
    const rate = this.rates[targetCurrency];
    return rate ? price * rate : price;
  }
}
