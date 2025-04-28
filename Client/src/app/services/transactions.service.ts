import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TransactionInterface } from '../../types/transaction-types';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private http = inject(HttpClient);

  getAllTransactions(): Observable<TransactionInterface[]> {
    return this.http.get<TransactionInterface[]>('/api/transactions/');
  }

  getCompanyTransactions(companyId: string): Observable<TransactionInterface[]> {
    return this.http.get<TransactionInterface[]>(`/api/transactions/company/${companyId}`);
  }

  getTransactionById(transactionId: string): Observable<TransactionInterface> {
    return this.http.get<TransactionInterface>(`/api/transactions/${transactionId}`);
  }
  
}
