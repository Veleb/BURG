import { Component, inject, OnInit } from '@angular/core';
import { CertificateService } from '../../services/certificate.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CertificateForCreate } from '../../../types/certificate-types';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../user/user.service';
import { UserFromDB } from '../../../types/user-types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-certificate',
  imports: [ FormsModule ],
  templateUrl: './add-certificate.component.html',
  styleUrl: './add-certificate.component.css'
})
export class AddCertificateComponent implements OnInit {

  private certificateService = inject(CertificateService);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userService.getUsers()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => {
        this.toastr.error(`Error occurred while fetching users`, `Error Occurred`);
      }
    })
  }

  users: UserFromDB[] = [];

  certificate: CertificateForCreate = {
    issuedTo: '',
    downloadLink: '',
    position: '',
    isRedeemed: false,
    redeemed_at: null,
    userId: null
  };

  onUserSelect(selectedUserId: string) {
    const selectedUser = this.users.find(user => user._id === selectedUserId);
    if (selectedUser) {
      this.certificate.issuedTo = selectedUser.fullName;
    }
  }
  
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