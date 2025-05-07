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

  verifyCertificate(): void {
    
    this.certificateService.verifyCertificate(this.certificateCode).subscribe({
      next: (response) => {
        this.toastr.success(`Certificate is valid!`, `Success`)
      },
      error: (error) => {
        console.error('Error verifying certificate:', error);
      }
    })



  }

}
