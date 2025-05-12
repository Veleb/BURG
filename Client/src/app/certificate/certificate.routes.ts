import { Routes } from "@angular/router";
import { VerifyCertificateComponent } from "./verify-certificate/verify-certificate.component";
import { AddCertificateComponent } from "./add-certificate/add-certificate.component";
import { adminGuard } from "../guards/admin.guard";

export const CERTIFICATE_ROUTES: Routes = [
  { path: "verify", component: VerifyCertificateComponent },
  { path: "add-certificate", component: AddCertificateComponent, canActivate: [ adminGuard ] },
];