import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserFromDB } from '../../types/user-types';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  private http = inject(HttpClient);;

  verifyCertificate(certificateCode: string): Observable<{ message: string, valid: boolean, downloadLink?: string }> {
    return this.http.post<{ message: string, valid: boolean, downloadLink?: string }>('/api/certificates/verify-certificate', { certificateCode });
  }

  addCertificate(certificateDownloadLink: string, userId: string): Observable<{ message: string, user: UserFromDB }> {
    return this.http.post<{ message: string, user: UserFromDB }>('/api/certificates/add', { certificateDownloadLink, userId });
  }

}
