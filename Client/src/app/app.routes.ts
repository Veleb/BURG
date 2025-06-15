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
import { PrivacyComponent } from './legal/privacy/privacy.component';
import { CompanyPageComponent } from './company/company-page/company-page.component';
import { VerifyCertificateComponent } from './certificate/verify-certificate/verify-certificate.component';
import { RedeemCertificateComponent } from './certificate/redeem-certificate/redeem-certificate.component';
import { authGuard } from './guards/auth.guard';
import { RefundComponent } from './legal/refund/refund.component';

export const routes: Routes = [
  { path: "", component: HomeComponent, pathMatch: "full" },
  
  { path: "home", component: HomeComponent },
  { path: "contact", component: ContactComponent },
  
  { path: "terms", component: TermsComponent },
  { path: "cookies-policy", component: CookiesPolicyComponent },
  { path: "eula", component: EulaComponent },
  { path: "privacy", component: PrivacyComponent },
  { path: "about", component: AboutComponent },
  { path: "become-host", component: BecomeHostComponent },
  { path: "faq", component: FaqComponent },
  { path: "refund", component: RefundComponent },


  { path: "certificate", component: VerifyCertificateComponent },
  { path: "redeem-certificate", component: RedeemCertificateComponent, canActivate: [ authGuard ] },
  
  { path: "company/:id", component: CompanyPageComponent },

  { 
    path: "auth",
    loadChildren: () => import('./user/user.routes').then(m => m.USER_ROUTES)
  },
  
  { 
    path: "dashboard",
    loadChildren: () => import('./dashboards/dashboards.routes').then(m => m.DASHBOARD_ROUTES)
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