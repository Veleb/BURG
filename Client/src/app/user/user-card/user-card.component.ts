import { Component, inject, Input } from '@angular/core';
import { UserFromDB } from '../../../types/user-types';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CertificateService } from '../../services/certificate.service';

@Component({
  selector: 'app-user-card',
  imports: [ FormsModule ],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent {
  private certificateService = inject(CertificateService);
  private toastr = inject(ToastrService);

  @Input() user?: UserFromDB;
  isAddingCertificate = false;
  certificateCodeInput = '';

  startAddingCertificate() {
    this.isAddingCertificate = true;
  }

  cancelAddCertificate() {
    this.isAddingCertificate = false;
    this.certificateCodeInput = '';
  }

  redeemCertificate() {
    if (!this.user?._id || !this.certificateCodeInput) return;

    this.certificateService.redeemUserCertificate(
      this.certificateCodeInput,
      this.user._id
    ).subscribe({
      next: (res) => {
        this.user = res.user;
        this.isAddingCertificate = false;
        this.toastr.success('Certificate redeemed successfully');
      },
      error: (err) => {
        this.toastr.error('Failed to redeem certificate');
        console.error('Error:', err);
      }
    });
  }
}