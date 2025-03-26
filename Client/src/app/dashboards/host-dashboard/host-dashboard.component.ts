import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user/user.service';
import { Router, ActivatedRoute, RouterOutlet, RouterLink } from '@angular/router';
import { CompanyInterface } from '../../../types/company-types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-host-dashboard',
  imports: [RouterOutlet, FormsModule, RouterLink],
  templateUrl: './host-dashboard.component.html',
  styleUrls: ['./host-dashboard.component.css']
})
export class HostDashboardComponent implements OnInit {
  companies: CompanyInterface[] = [];
  isCollapsed = false;
  selectedCompany?: string;

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.userService.getCompanies().subscribe({
      next: (data) => {
        this.companies = data;
        if (this.companies.length > 0) {
          this.selectedCompany = this.companies[0]._id;
          this.onCompanyChange(); 
        }
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

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
