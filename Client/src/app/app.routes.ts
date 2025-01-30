import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';
import { ProfileComponent } from './user/profile/profile.component';
import { CatalogComponent } from './catalog/catalog.component';
import { DetailsComponent } from './vehicle/details/details.component';
import { PaymentSuccessComponent } from './payments/payment-success/payment-success.component';
import { PaymentCancelComponent } from './payments/payment-cancel/payment-cancel.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },

  { path: "home", component: HomeComponent }, 
  { path: "contact", component: ContactComponent },
  
  { path: "login", component: LoginComponent, canActivate: [ guestGuard ] },
  { path: "register", component: RegisterComponent, canActivate: [ guestGuard ] },
  { path: "profile", component: ProfileComponent, canActivate: [ authGuard ] },

  { path: "catalog", children: [
    { path: "", component: CatalogComponent },
    { path: ":id" , component: DetailsComponent},
  ] },

  { path: 'success', component: PaymentSuccessComponent },
  { path: 'cancel', component: PaymentCancelComponent },

  { path: "404", component: PageNotFoundComponent },
  { path: "**", redirectTo: "/404", pathMatch: "full" }
];
