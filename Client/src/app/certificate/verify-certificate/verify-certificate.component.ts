import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificateService } from '../../services/certificate.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify-certificate',
  imports: [ FormsModule ],
  templateUrl: './verify-certificate.component.html',
  styleUrl: './verify-certificate.component.css'
})
export class VerifyCertificateComponent implements OnInit {

  private certificateService = inject(CertificateService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const code = params.get('code');
      if (code) {
        this.certificateCode = code;
        this.verifyCertificate(); 
      }
    });
  }

  certificateCode: string = '';
  validCertificateCode: string | undefined = undefined;
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
        this.validCertificateCode = response.code
        this.toastr.success(response.message, `Success`);
      },
      error: (error) => {
        const res = error as { message: string, valid: boolean, downloadLink: string, code: string };
        this.isValid = res.valid;
        this.hasVerified = true;
        this.isLoading = false;
        this.downloadLink = res.downloadLink;
        this.validCertificateCode = res.code
        console.error('Error verifying certificate:', error);
      }
    });
  }
}
