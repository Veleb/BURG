import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyInterface } from '../../types/company-types';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private http = inject(HttpClient);

  getAllCompanies(): Observable<CompanyInterface[]> {
    return this.http.get<CompanyInterface[]>('/api/companies/');
  }

  getCompanyById(companyId: string): Observable<CompanyInterface> {
    return this.http.get<CompanyInterface>(`/api/companies/${companyId}`);
  }

  getPendingCompanies(): Observable<CompanyInterface[]> {
    return this.http.get<CompanyInterface[]>(`/api/companies/pending`);
  }

  approveCompany(companyId: string): Observable<CompanyInterface> {
    return this.http.put<CompanyInterface>(`/api/companies/confirm/${companyId}`, {});
  }

  cancelCompany(companyId: string): Observable<CompanyInterface> {
    return this.http.put<CompanyInterface>(`/api/companies/cancel/${companyId}`, {});
  }

}
