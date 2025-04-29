import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CompanyService } from '../../../../../company/company.service';
import { CompanyInterface } from '../../../../../../types/company-types';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CompanyCardComponent } from '../../../../../company/company-card/company-card.component';

@Component({
  selector: 'app-dashboard-companies-view',
  imports: [ FormsModule, CompanyCardComponent ],
  templateUrl: './dashboard-companies-view.component.html',
  styleUrl: './dashboard-companies-view.component.css'
})
export class DashboardCompaniesViewComponent implements OnInit, OnDestroy {

  private companyService = inject(CompanyService);

  private destroy$ = new Subject<void>();

  ngOnInit() {

    this.companyService.getAllCompanies()
      .pipe(takeUntil(this.destroy$))
      .subscribe((companies: CompanyInterface[]) => {
        this.companies = companies;
    });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  companies: CompanyInterface[] = [];
  selectedStatus: string = 'all';

  filteredCompanies(): CompanyInterface[] {
    if (this.selectedStatus === 'all') return this.companies;
    return this.companies.filter(c => c.status === this.selectedStatus);
  }

}
