import { Routes } from "@angular/router";
import { UserDashboardComponent } from "./user-dashboard/user-dashboard.component";
import { authGuard } from "../guards/auth.guard";
import { HostDashboardComponent } from "./host-dashboard/host-dashboard.component";
import { hostGuard } from "../guards/host.guard";
import { adminGuard } from "../guards/admin.guard";
import { AdminDashboardComponent } from "./admin-dashboard/admin-dashboard.component";
import { HomeViewComponent } from "./host-dashboard/views/home-view/home-view.component";
import { VehiclesViewComponent } from "./host-dashboard/views/vehicles-view/vehicles-view.component";
import { RentsViewComponent } from "./host-dashboard/views/rents-view/rents-view.component";

export const DASHBOARD_ROUTES: Routes = [
  { path: "user", component: UserDashboardComponent, canActivate: [ authGuard ] },
  { path: "host", component: HostDashboardComponent, canActivate: [ hostGuard ],
    children: [
      { path: 'home', component: HomeViewComponent },
      { path: 'vehicles', component: VehiclesViewComponent },
      { path: 'rents', component: RentsViewComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: "admin", component: AdminDashboardComponent, canActivate: [ adminGuard ] },
];
