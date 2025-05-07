import { Component, inject, Input } from '@angular/core';
import { UserFromDB } from '../../../types/user-types';
import { UserService } from '../user.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-card',
  imports: [ FormsModule ],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent {
  
  private userService = inject(UserService);
  private toastr = inject(ToastrService);

  @Input() user?: UserFromDB;

  isAddingCertificate = false;
  certificateLinkInput = '';

  
  startAddingCertificate() {
    this.isAddingCertificate = true;
    this.certificateLinkInput = this.user?.certificateDownloadLink || '';
  }

  cancelAddCertificate() {
    this.isAddingCertificate = false;
    this.certificateLinkInput = '';
  }

  saveCertificateLink() {
    if (!this.user || !this.certificateLinkInput) return;

    this.userService.updateProfile({
      certificateDownloadLink: this.certificateLinkInput,
    }).subscribe({
      next: (res) => {
        this.user = res.user;
        this.isAddingCertificate = false;
        this.toastr.success(`Successfully attached certificate to user`, `Success`)
      },
      error: (err) => {
        this.toastr.error(`Failed to update certificate link`, `Error Occurred`)
        console.error('Failed to update certificate link', err);
      }
    });
  }
}
