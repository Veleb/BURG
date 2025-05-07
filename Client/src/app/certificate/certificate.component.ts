import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificateService } from '../services/certificate.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-certificate',
  imports: [ FormsModule ],
  templateUrl: './certificate.component.html',
  styleUrl: './certificate.component.css'
})
export class CertificateComponent {

  private certificateService = inject(CertificateService);
  private toastr = inject(ToastrService);

  certificateCode: string = '';
  downloadLink: string | undefined = undefined;
  isValid: boolean = false;
  isLoading: boolean = false;
  hasVerified: boolean = false; 

  verifyCertificate(): void {
    this.isLoading = true;
    this.certificateService.verifyCertificate(this.certificateCode).subscribe({
      next: (response) => {
        this.isValid = response.valid;
        this.hasVerified = true;
        this.isLoading = false;
        this.downloadLink = response.downloadLink;
        this.toastr.success(response.message, `Success`);
      },
      error: (error) => {
        const res = error as { message: string, valid: boolean, downloadLink: string };
        this.isValid = res.valid;
        this.hasVerified = true;
        this.isLoading = false;
        this.downloadLink = res.downloadLink;
        console.error('Error verifying certificate:', error);
      }
    });
  }
}
