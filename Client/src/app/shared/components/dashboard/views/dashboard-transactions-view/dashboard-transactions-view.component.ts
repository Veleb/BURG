import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TransactionsService } from '../../../../../services/transactions.service';
import { TransactionInterface } from '../../../../../../types/transaction-types';
import { UserService } from '../../../../../user/user.service';
import { ActivatedRoute } from '@angular/router';
import { UserFromDB } from '../../../../../../types/user-types';
import { combineLatest, Subject, switchMap, takeUntil } from 'rxjs';
import { DatePipe } from '../../../../pipes/date.pipe';
import { CurrencyConverterPipe } from '../../../../pipes/currency.pipe';
import { CurrencyService } from '../../../../../currency/currency.service';
import { PaginatorComponent } from "../../../paginator/paginator.component";
import { PhonepeService } from '../../../../../services/phonepe.service';

@Component({
  selector: 'app-dashboard-transactions-view',
  imports: [DatePipe, CurrencyConverterPipe, PaginatorComponent],
  templateUrl: './dashboard-transactions-view.component.html',
  styleUrl: './dashboard-transactions-view.component.css'
})
export class DashboardTransactionsViewComponent implements OnInit, OnDestroy {

  private transactionService = inject(TransactionsService);
  private userService = inject(UserService);
  private currencyService = inject(CurrencyService);
  private route = inject(ActivatedRoute);
  private phonepeService = inject(PhonepeService);

  private destroy$ = new Subject<void>();

  transactions: TransactionInterface[] = [];
  companySlug: string | undefined = undefined;
  user: UserFromDB | null = null;
  selectedCurrency: string = 'INR';

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  get offset() {
    return (this.currentPage - 1) * this.pageSize;
  }
  
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
        this.companySlug = params.get('companySlug') || undefined;

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
    if (this.companySlug) {
      this.transactionService.getCompanyTransactions(this.companySlug, this.pageSize, this.offset)
        .pipe(takeUntil(this.destroy$))
        .subscribe(({ transactions, totalCount }) => {
          this.transactions = transactions;
          this.totalCount = totalCount;
        });
    }
  }

  loadAdminTransactions() {
    this.transactionService.getAllTransactions(this.pageSize, this.offset)
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ transactions, totalCount }) => {
        this.transactions = transactions;
        this.totalCount = totalCount;
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.user?.role === 'admin' ? this.loadAdminTransactions() : this.loadHostTransactions();
  }

  onRefund(transaction: TransactionInterface) {
    const amount = transaction.total;
    const originalMerchantOrderId = transaction.merchantOrderId;

    this.phonepeService.refundPayment(originalMerchantOrderId, amount)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((refundResponse) => {
          const refundId = refundResponse.response.refundId;
          alert(`Refund initiated! Refund ID: ${refundId}`);
          return this.phonepeService.verifyRefund(originalMerchantOrderId);
        })
      )
      .subscribe({
        next: (verifyResponse) => {
          console.log('Refund verification response:', verifyResponse);
          alert('Refund verified successfully!');
          this.user?.role === 'admin' ? this.loadAdminTransactions() : this.loadHostTransactions();
        },
        error: (err) => {
          console.error('Refund or verification failed:', err);
          alert('Refund or verification failed. Please try again later.');
        }
      });
    }

}
