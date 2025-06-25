import { Routes } from "@angular/router";
import { PaymentSuccessComponent } from "./payment-success/payment-success.component";
import { PaymentCancelComponent } from "./payment-cancel/payment-cancel.component";
import { PaymentPendingComponent } from "./payment-pending/payment-pending.component";


export const PAYMENT_ROUTES: Routes = [
    { path: 'success', component: PaymentSuccessComponent },
    { path: 'cancel', component: PaymentCancelComponent },
    { path: 'pending', component: PaymentPendingComponent },
];