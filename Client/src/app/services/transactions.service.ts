import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TransactionInterface } from '../../types/transaction-types';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private http = inject(HttpClient);

  getAllTransactions(limit: number, offset: number): Observable<{ transactions: TransactionInterface[], totalCount: number }> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<{ transactions: TransactionInterface[], totalCount: number }>(
      '/api/transactions',
      { params }
    );
  }

  getCompanyTransactions(companySlug: string, limit: number, offset: number): Observable<{ transactions: TransactionInterface[], totalCount: number }> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<{ transactions: TransactionInterface[], totalCount: number }>(
      `/api/transactions/company/${companySlug}`,
      { params }
    );
  }

  getTransactionById(transactionId: string): Observable<TransactionInterface> {
    return this.http.get<TransactionInterface>(`/api/transactions/${transactionId}`);
  }
  
}
