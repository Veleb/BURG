import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyInterface } from '../../types/company-types';

@Injectable({
  providedIn: 'root'
})
export class HostService {

  private http = inject(HttpClient)

  createCompany(companyData: CompanyInterface): Observable<CompanyInterface> {
    return this.http.post<CompanyInterface>(`/api/companies`, companyData);
  }

  getCompanies(): Observable<CompanyInterface[]> {
    return this.http.get<CompanyInterface[]>(`/api/companies`);
  }

}