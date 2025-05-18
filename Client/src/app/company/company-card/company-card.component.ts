import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CompanyInterface } from '../../../types/company-types';
import { RouterLink } from '@angular/router';
import { CompanyService } from '../company.service';
import { Subject, takeUntil } from 'rxjs';
import { CurrencyConverterPipe } from '../../shared/pipes/currency.pipe';
import { CurrencyService } from '../../currency/currency.service';

@Component({
  selector: 'app-company-card',
  imports: [ RouterLink, CurrencyConverterPipe ],
  templateUrl: './company-card.component.html',
  styleUrl: './company-card.component.css'
})
export class CompanyCardComponent implements OnInit, OnDestroy {

  private companyService = inject(CompanyService);
  private currencyService = inject(CurrencyService);

  private destroy$ = new Subject<void>();

  @Input() company: CompanyInterface | null = null;

  ngOnInit(): void {
      this.currencyService.getCurrency()
      .pipe(takeUntil(this.destroy$))
      .subscribe((currency) => {
        this.selectedCurrency = currency;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectedCurrency: string = 'USD';

  confirmCompany(companyId: string) {
    if (this.company) {
      this.companyService.approveCompany(companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((company: CompanyInterface) => {
        this.company = company;
      });
    }
  } 

  rejectCompany(companyId: string) {
    if (this.company) {
      this.companyService.cancelCompany(companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((company: CompanyInterface) => {
        this.company = company;
      });
    }
  }

}
