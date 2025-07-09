import { Routes } from "@angular/router";
import { UserProfileComponent } from "./user-dashboard/user-profile/user-profile.component";
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
import { DashboardTransactionsViewComponent } from "../shared/components/dashboard/views/dashboard-transactions-view/dashboard-transactions-view.component";
import { DashboardCompaniesViewComponent } from "../shared/components/dashboard/views/dashboard-companies-view/dashboard-companies-view.component";
import { DashboardUsersViewComponent } from "../shared/components/dashboard/views/dashboard-users-view/dashboard-users-view.component";
import { UserDocumentsComponent } from "./user-dashboard/user-documents/user-documents.component";
import { UserDashboardComponent } from "./user-dashboard/user-dashboard.component";
import { AddCertificateComponent } from "../certificate/add-certificate/add-certificate.component";
import { authUserResolver } from "../resolvers/auth-user.resolver";

export const DASHBOARD_ROUTES: Routes = [
  { path: "user", component: UserDashboardComponent, canActivate: [ authGuard ],
    children: [
      { path: "profile", component: UserProfileComponent, resolve: { user: authUserResolver }, },
      { path: "documents", component: UserDocumentsComponent, resolve: { user: authUserResolver }, },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
   },
  { path: "host", component: HostDashboardComponent, canActivate: [ hostGuard ],
    children: [
      { path: 'home', component: DashboardHomeViewComponent, resolve: { user: authUserResolver } },
      { path: 'vehicles', component: DashboardVehiclesViewComponent, resolve: { user: authUserResolver } },
      { path: 'add-vehicle', component: AddVehicleComponent, resolve: { user: authUserResolver } },
      { path: 'edit-vehicle', component: EditVehicleComponent, resolve: { user: authUserResolver } },
      { path: 'rents', component: DashboardRentsViewComponent, resolve: { user: authUserResolver } },
      { path: 'transactions', component: DashboardTransactionsViewComponent, resolve: { user: authUserResolver } },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: "admin", component: AdminDashboardComponent, canActivate: [ adminGuard ],
    resolve: {
      user: authUserResolver
    },
    children: [
      { path: 'home', component: DashboardHomeViewComponent, resolve: { user: authUserResolver } },
      { path: 'vehicles', component: DashboardVehiclesViewComponent, resolve: { user: authUserResolver } },
      { path: 'add-vehicle', component: AddVehicleComponent, resolve: { user: authUserResolver } },
      { path: 'rents', component: DashboardRentsViewComponent, resolve: { user: authUserResolver } },
      { path: 'users', component: DashboardUsersViewComponent, resolve: { user: authUserResolver } },
      { path: 'transactions', component: DashboardTransactionsViewComponent, resolve: { user: authUserResolver } },
      { path: 'companies', component: DashboardCompaniesViewComponent, resolve: { user: authUserResolver } },
      { path: 'certificates', component: UserDocumentsComponent, resolve: { user: authUserResolver } },
      { path: 'add-certificate', component: AddCertificateComponent, resolve: { user: authUserResolver } },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
   },
];
