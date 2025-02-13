import { Component, Input, OnInit } from '@angular/core';
import { VehicleInterface } from '../../../types/vehicle-types';
import { RouterLink } from '@angular/router';
import { CurrencyConverterPipe } from '../../shared/pipes/currency.pipe';
import { CurrencyService } from '../../currency/currency.service';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-product-card',
    imports: [RouterLink, CurrencyConverterPipe, CurrencyPipe],
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnInit {
  
  @Input() vehicle: VehicleInterface | undefined = undefined;
  selectedCurrency: string = 'USD';

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.currencyService.getCurrency().subscribe(currency => {
      this.selectedCurrency = currency;
    });
  }

  currentIndex: number = 0;

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.vehicle!.images.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.vehicle!.images.length) % this.vehicle!.images.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

}
