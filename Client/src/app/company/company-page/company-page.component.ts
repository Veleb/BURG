import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanyService } from '../company.service';
import { Subject, takeUntil } from 'rxjs';
import { CompanyInterface } from '../../../types/company-types';
import { CurrencyConverterPipe } from '../../shared/pipes/currency.pipe';
import { ProductCardComponent } from '../../vehicle/product-card/product-card.component';
import { DatePipe } from '../../shared/pipes/date.pipe';

@Component({
  selector: 'app-company-page',
  imports: [ProductCardComponent, DatePipe],
  templateUrl: './company-page.component.html',
  styleUrl: './company-page.component.css'
})
export class CompanyPageComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);

  private destroy$ = new Subject<void>();

  company: CompanyInterface | undefined = undefined;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('companySlug');
      
      if (slug) {
        this.companyService.getCompanyBySlug(slug)
          .pipe(takeUntil(this.destroy$))
          .subscribe(company => {
            this.company = company;
          });
      }
    })
        
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
}
