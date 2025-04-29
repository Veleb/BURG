import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TransactionsService } from '../../../../../services/transactions.service';
import { TransactionInterface } from '../../../../../../types/transaction-types';
import { UserService } from '../../../../../user/user.service';
import { ActivatedRoute } from '@angular/router';
import { UserFromDB } from '../../../../../../types/user-types';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { DatePipe } from '../../../../pipes/date.pipe';
import { CurrencyConverterPipe } from '../../../../pipes/currency.pipe';
import { CurrencyPipe } from '@angular/common';
import { CurrencyService } from '../../../../../currency/currency.service';

@Component({
  selector: 'app-dashboard-transactions-view',
  imports: [ DatePipe, CurrencyConverterPipe, CurrencyPipe ],
  templateUrl: './dashboard-transactions-view.component.html',
  styleUrl: './dashboard-transactions-view.component.css'
})
export class DashboardTransactionsViewComponent implements OnInit, OnDestroy{

  private transactionService = inject(TransactionsService);
  private userService = inject(UserService);
  private currencyService = inject(CurrencyService);
  private route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  transactions: TransactionInterface[] = [];
  companyId: string | undefined = undefined;
  user: UserFromDB | null = null;
  selectedCurrency: string = 'USD';

  ngOnInit(): void {
    this.userService.getProfile().subscribe();

    this.currencyService.getCurrency()
      .pipe(takeUntil(this.destroy$))
      .subscribe(currency => {
        this.selectedCurrency = currency;
    });

    combineLatest([this.userService.user$, this.route.queryParamMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([user, params]) => {
        this.user = user;
        this.companyId = params.get('companyId') || undefined;

        if (user) {
          user.role === 'admin' ? this.loadAdminTransactions() : this.loadHostTransactions();
        } 
        
      }
    );

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHostTransactions() {
    if (this.companyId) {
      this.transactionService.getCompanyTransactions(this.companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(transactions => {
        this.transactions = transactions;
      });
    }
  }

  loadAdminTransactions() {
    this.transactionService.getAllTransactions()
    .pipe(takeUntil(this.destroy$))
    .subscribe(transactions => {
      this.transactions = transactions;
    });
  }

}
