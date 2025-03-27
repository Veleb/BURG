import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardSidebarComponent } from "../../shared/components/dashboard/dashboard-sidebar/dashboard-sidebar.component";

@Component({
  selector: 'app-host-dashboard',
  imports: [RouterOutlet, DashboardSidebarComponent],
  templateUrl: './host-dashboard.component.html',
  styleUrls: ['./host-dashboard.component.css']
})
export class HostDashboardComponent {
}
