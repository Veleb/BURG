import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-payment-cancel',
    imports: [ RouterLink ],
    templateUrl: './payment-cancel.component.html',
    styleUrl: './payment-cancel.component.css'
})
export class PaymentCancelComponent implements OnInit {

  rentId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.rentId = this.route.snapshot.queryParamMap.get('rentId');

    if (!this.rentId) {
      this.toastr.error('No rent ID found in the URL.');
    }
  }

}