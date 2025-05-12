import { Component } from '@angular/core';
import { DashboardSidebarComponent } from '../../shared/components/dashboard/dashboard-sidebar/dashboard-sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  imports: [ DashboardSidebarComponent, RouterOutlet ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {

}
