import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RentService } from '../../rents/rent.service';

@Component({
    selector: 'app-payment-cancel',
    imports: [],
    templateUrl: './payment-cancel.component.html',
    styleUrl: './payment-cancel.component.css'
})
export class PaymentCancelComponent implements OnInit {

  rentId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private rentService: RentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.rentId = this.route.snapshot.queryParamMap.get('rentId');

    if (this.rentId) {
      this.cancelRent(this.rentId);
    } else {
      this.toastr.error('No rent ID found in the URL.');
    }
  }

  private cancelRent(rentId: string): void {
    this.rentService.cancelRent(rentId).subscribe({
      next: () => {
        this.toastr.success('Rent canceled successfully.', 'Success', {
          timeOut: 3000,
          closeButton: true
        });
      },
      error: () => {
        this.toastr.error('Failed to cancel rent.', 'Error Occurred');
      },
    });
  }

}
