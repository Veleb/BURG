import { Component, inject, OnInit } from '@angular/core';
import { CertificateService } from '../../services/certificate.service';
import { FormsModule } from '@angular/forms';
import { CertificateForCreate } from '../../../types/certificate-types';

@Component({
  selector: 'app-add-certificate',
  imports: [ FormsModule ],
  templateUrl: './add-certificate.component.html',
  styleUrl: './add-certificate.component.css'
})
export class AddCertificateComponent implements OnInit {

  private certificateService = inject(CertificateService);

  ngOnInit(): void {
    
  }

  certificate: CertificateForCreate = {
    issuedTo: '',
    downloadLink: '',
    position: '',
    isRedeemed: false,
    redeemed_at: null,
    userId: null
  };

  onSubmit() {
    this.certificateService.addCertificate(this.certificate).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err => {
        console.log(err)
      })
    })
  }

}