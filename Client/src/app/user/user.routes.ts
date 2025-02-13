import { Routes } from "@angular/router";
import { guestGuard } from "../guards/guest.guard";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ProfileComponent } from "./profile/profile.component";
import { authGuard } from "../guards/auth.guard";

export const USER_ROUTES: Routes = [
  { path: "login", component: LoginComponent, canActivate: [ guestGuard ] },
  { path: "register", component: RegisterComponent, canActivate: [ guestGuard ] },
  { path: "profile", component: ProfileComponent, canActivate: [ authGuard ] }
];