import { Component, inject } from '@angular/core';
import { CertificateService } from '../../services/certificate.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CertificateForCreate } from '../../../types/certificate-types';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-certificate',
  imports: [ FormsModule ],
  templateUrl: './add-certificate.component.html',
  styleUrl: './add-certificate.component.css'
})
export class AddCertificateComponent {

  private certificateService = inject(CertificateService);
  private toastr = inject(ToastrService);

  certificate: CertificateForCreate = {
    issuedTo: '',
    downloadLink: '',
    position: '',
    isRedeemed: false,
    redeemed_at: null,
    userId: null
  };

  onSubmit(certificateForm: NgForm) {
    this.certificateService.addCertificate(this.certificate).subscribe({
      next: (res) => {
        this.toastr.success(`Successfully created certificate`, `Success`);
        certificateForm.reset();
      },
      error: (err => {
        this.toastr.success(`Error occurred while creating certificate`, `Error Occurred`);
      })
    })
  }

}