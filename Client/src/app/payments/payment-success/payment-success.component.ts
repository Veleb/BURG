import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PhonepeService } from '../../services/phonepe.service';

@Component({
    selector: 'app-payment-success',
    imports: [ RouterLink ],
    templateUrl: './payment-success.component.html',
    styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent implements OnInit {

  private route = inject(ActivatedRoute)
  private phonepeService = inject(PhonepeService)

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      
      if (orderId) {
        this.phonepeService.verifyPayment(orderId).subscribe();
      }
    });
  }

  
  
}
