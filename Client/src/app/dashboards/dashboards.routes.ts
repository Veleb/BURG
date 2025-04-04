import { Routes } from "@angular/router";
import { UserDashboardComponent } from "./user-dashboard/user-dashboard.component";
import { authGuard } from "../guards/auth.guard";
import { HostDashboardComponent } from "./host-dashboard/host-dashboard.component";
import { hostGuard } from "../guards/host.guard";
import { adminGuard } from "../guards/admin.guard";
import { AdminDashboardComponent } from "./admin-dashboard/admin-dashboard.component";
import { DashboardHomeViewComponent } from "../shared/components/dashboard/views/dashboard-home-view/dashboard-home-view.component";
import { DashboardVehiclesViewComponent } from "../shared/components/dashboard/views/dashboard-vehicles-view/dashboard-vehicles-view.component";
import { DashboardRentsViewComponent } from "../shared/components/dashboard/views/dashboard-rents-view/dashboard-rents-view.component";
import { AddVehicleComponent } from "../vehicle/add-vehicle/add-vehicle.component";
import { EditVehicleComponent } from "../vehicle/edit-vehicle/edit-vehicle.component";

export const DASHBOARD_ROUTES: Routes = [
  { path: "user", component: UserDashboardComponent, canActivate: [ authGuard ] },
  { path: "host", component: HostDashboardComponent, canActivate: [ hostGuard ],
    children: [
      { path: 'home', component: DashboardHomeViewComponent },
      { path: 'vehicles', component: DashboardVehiclesViewComponent },
      { path: 'rents', component: DashboardRentsViewComponent },
      { path: 'add-vehicle', component: AddVehicleComponent },
      { path: 'edit-vehicle', component: EditVehicleComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: "admin", component: AdminDashboardComponent, canActivate: [ adminGuard ],
    children: [
      { path: 'home', component: DashboardHomeViewComponent },
      { path: 'vehicles', component: DashboardVehiclesViewComponent },
      { path: 'rents', component: DashboardRentsViewComponent },
      { path: 'add-vehicle', component: AddVehicleComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
   },
];
