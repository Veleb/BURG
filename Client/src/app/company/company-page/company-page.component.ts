import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanyService } from '../company.service';
import { Subject, takeUntil } from 'rxjs';
import { CompanyInterface } from '../../../types/company-types';
import { CompanyCardComponent } from "../company-card/company-card.component";

@Component({
  selector: 'app-company-page',
  imports: [CompanyCardComponent],
  templateUrl: './company-page.component.html',
  styleUrl: './company-page.component.css'
})
export class CompanyPageComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private companyService = inject(CompanyService);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const companyId = params.get('id');
      
      if (companyId) {
        this.companyService.getCompanyById(companyId)
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

  company: CompanyInterface | null = null;
}
