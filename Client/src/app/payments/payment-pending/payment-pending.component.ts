import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhonepeService } from '../../services/phonepe.service';
import { interval, Subscription, takeWhile } from 'rxjs';

@Component({
  selector: 'app-payment-pending',
  templateUrl: './payment-pending.component.html',
  styleUrl: './payment-pending.component.css'
})
export class PaymentPendingComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private phonepeService = inject(PhonepeService);
  private router = inject(Router);
  private pollingSub?: Subscription;
  private pollingInterval = 5000;
  private maxDuration = 5 * 60 * 1000; 
  private pollingStartTime = Date.now();

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');

    if (!orderId) return;

    this.pollingSub = interval(this.pollingInterval)
      .pipe(
        takeWhile(() => Date.now() - this.pollingStartTime < this.maxDuration)
      )
      .subscribe(() => {
        this.phonepeService.checkPaymentStatus(orderId).subscribe({
          next: (response) => {
            const state = response.status?.state;

            if (state === 'COMPLETED') {
              this.cleanup();
              this.router.navigate(['/payments/success'], { queryParams: { orderId } });
            } else if (state === 'FAILED') {
              this.cleanup();
              this.router.navigate(['/payments/cancel'], { queryParams: { orderId } });
            } 
          },
          error: (err) => {
            console.error('Error polling payment status', err);
          }
        });
      });
  }

  private cleanup() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
