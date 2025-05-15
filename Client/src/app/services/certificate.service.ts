  import { HttpClient } from '@angular/common/http';
  import { inject, Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
  import { UserFromDB } from '../../types/user-types';
  import { CertificateForCreate, CertificateInterface } from '../../types/certificate-types';

  @Injectable({
    providedIn: 'root'
  })
  export class CertificateService {

    private http = inject(HttpClient);;

    verifyCertificate(certificateCode: string): Observable<{ message: string, valid: boolean, downloadLink?: string, code?: string }> {
      return this.http.post<{ message: string, valid: boolean, downloadLink?: string }>('/api/certificates/verify-certificate', { certificateCode });
    }

    addCertificate(certificate: CertificateForCreate): Observable<{ message: string, user: UserFromDB }> {
      return this.http.post<{ message: string, user: UserFromDB }>('/api/certificates/add', { certificate });
    }

    redeemUserCertificate(certificateCode: string, userId: string): Observable<{ message: string, cert: CertificateInterface}> {
      return this.http.post<{ message: string, cert: CertificateInterface}>(`/api/certificates/add-user`, { certificateCode, userId });
    }

    getAllUserCertificates(): Observable<{ message: string, certificates: CertificateInterface[] }> {
      return this.http.get<{ message: string, certificates: CertificateInterface[] }>(`/api/certificates/users`);
    }

    getAllCertificates(): Observable<{ message: string, certificates: CertificateInterface[] }> {
      return this.http.get<{ message: string, certificates: CertificateInterface[] }>(`/api/certificates/`);
    }

  }
