import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {

  private http = inject(HttpClient);;

  verifyCertificate(certificateCode: string) {
    return this.http.post('/api/certificates/verify-certificate', { certificateCode });
  }

}
