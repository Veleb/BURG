import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './user/login/login.component';
import { RegisterComponent } from './user/register/register.component';

export const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },

  { path: "home", component: HomeComponent },
  { path: "contact", component: ContactComponent },
  
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },

  { path: "404", component: PageNotFoundComponent },
  { path: "**", redirectTo: "/404", pathMatch: "full" }
];
