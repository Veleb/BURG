import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PhonepeService } from '../../services/phonepe.service';

@Component({
  selector: 'app-payment-cancel',
  imports: [RouterLink],
  templateUrl: './payment-cancel.component.html',
  styleUrl: './payment-cancel.component.css'
})
export class PaymentCancelComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private phonepeService = inject(PhonepeService);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];

      if (orderId) {
        this.phonepeService.verifyPayment(orderId).subscribe();
      }
    });
  }

}
