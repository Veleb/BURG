import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyInterface } from '../../types/company-types';

@Injectable({
  providedIn: 'root'
})
export class HostService {

  constructor(
    private http: HttpClient,
  ) { }

  createCompany(companyData: CompanyInterface): Observable<CompanyInterface> {
    return this.http.post<CompanyInterface>(`/api/companies`, companyData);
  }

  getCompanyById(companyId: string): Observable<CompanyInterface> {
    return this.http.get<CompanyInterface>(`/api/companies/${companyId}`);
  }

}
