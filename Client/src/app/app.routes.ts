import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ContactComponent } from './contact/contact.component';
import { TermsComponent } from './legal/terms/terms.component';
import { CookiesPolicyComponent } from './legal/cookies-policy/cookies-policy.component';
import { EulaComponent } from './legal/eula/eula.component';
import { BecomeHostComponent } from './become-host/become-host.component';
import { AboutComponent } from './about/about.component';
import { FaqComponent } from './faq/faq.component';

export const routes: Routes = [
  { path: "", redirectTo: "catalog", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "contact", component: ContactComponent },
  
  { path: "terms", component: TermsComponent },
  { path: "cookies-policy", component: CookiesPolicyComponent },
  { path: "eula", component: EulaComponent },
  { path: "about", component: AboutComponent },
  { path: "become-host", component: BecomeHostComponent },
  { path: "faq", component: FaqComponent },

  { 
    path: "auth",
    loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES)
  },
  
  {
    path: "catalog",
    loadChildren: () => import('./catalog/catalog.routes').then(m => m.CATALOG_ROUTES)
  },
  
  {
    path: "payments",
    loadChildren: () => import('./payments/payment.routes').then(m => m.PAYMENT_ROUTES)
  }, 

  { path: "404", component: PageNotFoundComponent },
  { path: "**", redirectTo: "/404", pathMatch: "full" }
];