import { Routes } from "@angular/router";
import { guestGuard } from "../guards/guest.guard";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";

export const USER_ROUTES: Routes = [
  { path: "login", component: LoginComponent, canActivate: [ guestGuard ] },
  { path: "register", component: RegisterComponent, canActivate: [ guestGuard ] },
];