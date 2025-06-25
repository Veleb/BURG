import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { UserService } from '../../../../user/user.service';
import { CompanyInterface } from '../../../../../types/company-types';
import { FormsModule } from '@angular/forms';
import { combineLatest, filter, Subject, takeUntil } from 'rxjs';
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
  isProfileSection: boolean = false; 

  ngOnInit(): void {
    this.userService.getProfile().subscribe();

    this.isProfileSection = this.router.url.startsWith('/dashboard/user');

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.isProfileSection = event.url.startsWith('/dashboard/user');
    });

    combineLatest([
      this.userService.user$,
      this.userService.getCompanies()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([user, companies]) => {
      this.user = user;
      this.companies = companies;

      if (!this.isProfileSection  && this.companies.length > 0) {
        this.selectedCompany = this.selectedCompany || this.companies[0].slug;
        this.onCompanyChange();
      }
    });
  }

  onCompanyChange() {
    if (this.selectedCompany && !this.isProfileSection) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { companySlug: this.selectedCompany },
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
