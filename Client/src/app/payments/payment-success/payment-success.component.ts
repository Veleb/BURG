import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StripeService } from '../../services/stripe.service';

@Component({
    selector: 'app-payment-success',
    imports: [],
    templateUrl: './payment-success.component.html',
    styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent implements OnInit {

  constructor(private route: ActivatedRoute, private stripeService: StripeService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      
      if (sessionId) {
        this.stripeService.verifyPayment(sessionId).subscribe();
      }
    });
  }

}
