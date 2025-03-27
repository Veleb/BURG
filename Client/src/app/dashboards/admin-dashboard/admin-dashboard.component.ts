import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { DashboardSidebarComponent } from "../../shared/components/dashboard/dashboard-sidebar/dashboard-sidebar.component";

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterOutlet, FormsModule, DashboardSidebarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

}
