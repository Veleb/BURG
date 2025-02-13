import { Component } from '@angular/core';
import { CurrencyService } from './currency.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './currency.component.html',
  styleUrl: './currency.component.css'
})
export class CurrencyComponent {
  currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
  selectedCurrency = 'USD';

  constructor(private currencyService: CurrencyService) {
    currencyService.getCurrency().subscribe(currency => {
      this.selectedCurrency = currency;
    });
  }

  onCurrencyChange(event: Event) {
    const selectedCurrency = (event.target as HTMLSelectElement).value;
    this.currencyService.setCurrency(selectedCurrency);
  }
}
