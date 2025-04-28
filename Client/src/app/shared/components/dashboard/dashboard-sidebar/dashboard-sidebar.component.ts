import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { UserService } from '../../../../user/user.service';
import { CompanyInterface } from '../../../../../types/company-types';
import { FormsModule } from '@angular/forms';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { UserFromDB } from '../../../../../types/user-types';

@Component({
  selector: 'app-dashboard-sidebar',
  imports: [RouterLink, FormsModule, RouterModule],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.css'
})
export class DashboardSidebarComponent implements OnInit, OnDestroy {

  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>;

  isCollapsed: boolean = true;
  companies: CompanyInterface[] = [];
  selectedCompany: string | undefined = undefined;
  user: UserFromDB | null = null;

  ngOnInit(): void {
    this.userService.getProfile().subscribe();

    combineLatest([
      this.userService.user$,
      this.userService.getCompanies()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([user, companies]) => {
      this.user = user;
      this.companies = companies;

      if (this.companies.length > 0) {
        this.selectedCompany = this.selectedCompany || this.companies[0]._id;
        this.onCompanyChange();
      }
    });
  }

  onCompanyChange() {
    if (this.selectedCompany) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { companyId: this.selectedCompany },
        queryParamsHandling: 'merge'
      });
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
