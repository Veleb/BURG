import { Component, Input } from '@angular/core';
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
  @Input() color: string = "black";

  currencies = ['INR' ,'USD', 'EUR', 'GBP', 'JPY', 'CAD'];
  selectedCurrency = 'INR';

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
