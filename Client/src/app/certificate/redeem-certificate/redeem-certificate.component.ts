import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificateService } from '../../services/certificate.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-redeem-certificate',
  imports: [ FormsModule ],
  templateUrl: './redeem-certificate.component.html',
  styleUrl: './redeem-certificate.component.css'
})
export class RedeemCertificateComponent {

  private certificateService = inject(CertificateService);
  private toastr = inject(ToastrService);

  certificateCode: string = '';

  redeemCertificate(): void {

    this.certificateService.redeemUserCertificate(this.certificateCode, '').subscribe({
      next: ((res) => {
        this.toastr.success(res.message, 'Success');
      }),
      error: ((err) => {
        console.log(err);
        this.toastr.error('Error occurred while redeeming certificate!', 'Error Occurred');
      })
    })

  }

}
