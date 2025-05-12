import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CertificateService } from '../../../services/certificate.service';
import { Subject, takeUntil } from 'rxjs';
import { CertificateInterface } from '../../../../types/certificate-types';
import { CertificateCardComponent } from '../../../certificate/certificate-card/certificate-card.component';
import { UserService } from '../../../user/user.service';
import { UserFromDB } from '../../../../types/user-types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-documents',
  imports: [ CertificateCardComponent, RouterLink],
  templateUrl: './user-documents.component.html',
  styleUrl: './user-documents.component.css'
})
export class UserDocumentsComponent implements OnInit, OnDestroy {

  private certificateService = inject(CertificateService);
  private userService = inject(UserService);
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userService.getProfile();

    this.userService.user$
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (user => {
        this.user = user;

        this.user?.role === 'admin' ? this.loadAdminData() : this.loadUserData();

      })
    })

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  certificates: CertificateInterface[] = [];
  user: UserFromDB | null = null;

  private loadUserData(): void {

    this.certificateService.getAllUserCertificates()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.certificates = res.certificates;
      }
    });

  }

  private loadAdminData(): void {

    this.certificateService.getAllCertificates()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.certificates = res.certificates;
      }
    });

  }

}
