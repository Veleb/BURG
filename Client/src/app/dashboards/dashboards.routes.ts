import { Routes } from "@angular/router";
import { UserDashboardComponent } from "./user-dashboard/user-dashboard.component";
import { authGuard } from "../guards/auth.guard";


export const DASHBOARD_ROUTES: Routes = [
  { path: "user", component: UserDashboardComponent, canActivate: [ authGuard ] },
];