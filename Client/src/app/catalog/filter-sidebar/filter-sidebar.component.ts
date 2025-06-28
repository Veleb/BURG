import { Component, inject, Input, OnChanges, OnDestroy, OnInit, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { DatepickerComponent } from "../../shared/components/datepicker/datepicker.component";
import { VehicleService } from '../../vehicle/vehicle.service';
import { environment } from '../../../environments/environment';
import { UppercasePipe } from '../../shared/pipes/uppercase.pipe';
import { Category } from '../../../types/enums';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { CurrencyService } from '../../currency/currency.service';
import { combineLatest, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-sidebar',
  imports: [DatepickerComponent, UppercasePipe, FormsModule, NgxSliderModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.css'
})
export class FilterSidebarComponent implements OnInit, OnDestroy, OnChanges {

  private vehicleService = inject(VehicleService);
  private currencyService = inject(CurrencyService);
  private platformId = inject(PLATFORM_ID);

  private destroy$ = new Subject<void>();

  @Input() mainCategory!: string;
  @Input() startDate: Date | null = null;
  @Input() endDate: Date | null = null;
  @Input() queryCategory: string | null = null;

  @ViewChild('datepicker') datepicker!: DatepickerComponent;

  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;

  categories: Category[] = environment.categories;
  activeCategories: string[] = [];

  showOnlyAvailable: boolean = true;

  priceFilterMode: 'manual' | 'slider' = 'slider';

  priceMin: number = 50;
  priceMax: number = 1000;

  median: number = 0;

  minPrice: number = 0;
  maxPrice: number = 0;

  logMinPrice: number = 0;
  logMaxPrice: number = 0;

  baseMinPrice: number = 0;
  baseMaxPrice: number = 0;

  latestExchangeRate: number = 0;

  currencySymbol: string = "₹";
  showSlider = true;

  priceSliderOptions: Options = {
      floor: this.priceMin,
      ceil: this.priceMax,
      step: 1,
      showTicks: true,
      ticksArray: [this.median],
      translate: (value: number): string => `${this.currencySymbol}${value}`,
      showTicksValues: true,
  }

  isBrowserFlag: boolean = false;

  ngOnInit() {
    
    this.isBrowserFlag = isPlatformBrowser(this.platformId);
    
    if (this.isBrowserFlag) {
      this.setUpPriceSlider();
    }

  this.currencyService.getCurrency()
    .pipe(takeUntil(this.destroy$))
    .subscribe(currency => {
      this.currencySymbol = this.currencyService.getCurrencySymbol(currency);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['startDate'] || changes['endDate']) && this.isBrowser()) {
      if (this.datepicker) { 
        this.datepicker.startDate.nativeElement.value = this.startDate ? this.startDate.toISOString().split('T')[0] : '';
        this.datepicker.endDate.nativeElement.value = this.endDate ? this.endDate.toISOString().split('T')[0] : '';
      }
      this.vehicleService.updateAvailableVehicles(this.startDate, this.endDate);
    }

    if (changes['queryCategory']) {
      this.activeCategories = this.queryCategory ? [this.queryCategory] : [];

      this.vehicleService.setCategories(this.activeCategories);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setUpPriceSlider() {
    combineLatest([
      this.vehicleService.priceData$,
      this.currencyService.rate$,
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([data, rate]) => {
      this.latestExchangeRate = rate;
    
      const convertedMin = data.min * rate;
      const convertedMid = data.mid * rate;
      const convertedMax = data.max * rate;
    
      this.minPrice = convertedMin;
      this.median = convertedMid;
      this.maxPrice = convertedMax;
    
      this.logMinPrice = this.log10(convertedMin);
      this.logMaxPrice = this.log10(convertedMax);
    
      this.priceSliderOptions = {
        floor: this.logMinPrice,
        ceil: this.logMaxPrice,
        step: 0.000001,
        showTicks: false,
        translate: (value: number): string => {
          const actualPrice = Math.round(this.pow10(value));
          return `${this.currencySymbol}${actualPrice}`;
        }
    };

      this.onPriceChange()

      // force slider rerender
      this.showSlider = false;
      setTimeout(() => this.showSlider = true, 0);
    });
  }

  onMinRangeChange() {
    if (this.minPrice > this.maxPrice - 1) {
      this.minPrice = this.maxPrice - 1;
    }
    // this.onPriceChange();
}

  onMaxRangeChange() {
    if (this.maxPrice < this.minPrice + 1) {
      this.maxPrice = this.minPrice + 1;
    }
    // this.onPriceChange();
  }

  getRangeLeft(): number {
    return ((this.minPrice - this.priceMin) / (this.priceMax - this.priceMin)) * 100;
  }

  getRangeWidth(): number {
    return ((this.maxPrice - this.minPrice) / (this.priceMax - this.priceMin)) * 100;
  }

  onPriceChange(): void {
    const rate = this.latestExchangeRate;

    const actualConvertedMin = Math.round(this.pow10(this.logMinPrice));
    const actualConvertedMax = Math.round(this.pow10(this.logMaxPrice));

    const usdMin = Math.round(actualConvertedMin / rate);
    const usdMax = Math.round(actualConvertedMax / rate);

    this.vehicleService.setPriceRange(usdMin, usdMax);
    
  }

  private log10(value: number): number {
    return Math.log10(value);
  }

  private pow10(value: number): number {
    return Math.pow(10, value);
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

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  
  toggleShowOnlyAvailable() {
    this.showOnlyAvailable = !this.showOnlyAvailable;
    this.vehicleService.setShowOnlyAvailable(this.showOnlyAvailable);
  }

}
