import { Routes } from "@angular/router";
import { PaymentSuccessComponent } from "./payment-success/payment-success.component";
import { PaymentCancelComponent } from "./payment-cancel/payment-cancel.component";


export const PAYMENT_ROUTES: Routes = [
    { path: 'success', component: PaymentSuccessComponent },
    { path: 'cancel', component: PaymentCancelComponent },
];