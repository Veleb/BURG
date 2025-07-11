import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CertificateService } from '../../../services/certificate.service';
import { Subject, takeUntil } from 'rxjs';
import { CertificateInterface } from '../../../../types/certificate-types';
import { CertificateCardComponent } from '../../../certificate/certificate-card/certificate-card.component';
import { UserFromDB } from '../../../../types/user-types';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RentService } from '../../../rents/rent.service';
import { RentInterface } from '../../../../types/rent-types';
import { DatePipe } from '../../../shared/pipes/date.pipe';

@Component({
  selector: 'app-user-documents',
  imports: [ CertificateCardComponent, RouterLink, DatePipe],
  templateUrl: './user-documents.component.html',
  styleUrl: './user-documents.component.css'
})
export class UserDocumentsComponent implements OnInit, OnDestroy {

  private certificateService = inject(CertificateService);
  private rentService = inject(RentService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.checkAdminCertificateRoute();

    if (this.user?.role === 'admin') {
      this.loadAdminData();
    } else {
      this.loadUserData();
    }

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  certificates: CertificateInterface[] = [];
  receipts: string[] = [];
  rents: RentInterface[] = [];
  user: UserFromDB | null = this.route.snapshot.data['user'];

  showOnlyCertificates: boolean = false;

  private checkAdminCertificateRoute(): void {
    const currentUrl = this.router.url;
    this.showOnlyCertificates = currentUrl.includes('/dashboard/admin/certificates');
  }

  private loadUserData(): void {
    this.certificateService.getAllUserCertificates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.certificates = res.certificates;
        }
      });

    this.rentService.getUserReceipts(this.user?._id || '').subscribe({
      next: (res) => {
        this.receipts = res.receipts;
        this.rents = res.rents;
      },
      error: (err) => {
        console.error('Error loading user receipts:', err);
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

    this.rentService.getAllReceipts().subscribe({
      next: (res) => {
        this.receipts = res.receipts;
        this.rents = res.rents;
      },
      error: (err) => {
        console.error('Error loading receipts:', err);
      }
    });
  }
}