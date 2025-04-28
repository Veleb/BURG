import { Component, inject, OnInit } from '@angular/core';
import { TransactionsService } from '../../../../../services/transactions.service';
import { TransactionInterface } from '../../../../../../types/transaction-types';
import { UserService } from '../../../../../user/user.service';
import { ActivatedRoute } from '@angular/router';
import { UserFromDB } from '../../../../../../types/user-types';
import { combineLatest } from 'rxjs';
import { DatePipe } from '../../../../pipes/date.pipe';
import { CurrencyConverterPipe } from '../../../../pipes/currency.pipe';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-transactions-view',
  imports: [ DatePipe, CurrencyConverterPipe, CurrencyPipe ],
  templateUrl: './dashboard-transactions-view.component.html',
  styleUrl: './dashboard-transactions-view.component.css'
})
export class DashboardTransactionsViewComponent implements OnInit {

  private transactionService = inject(TransactionsService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  transactions: TransactionInterface[] = [];
  companyId: string | undefined = undefined;
  user: UserFromDB | null = null;

  ngOnInit(): void {
    this.userService.getProfile().subscribe();

    combineLatest([this.userService.user$, this.route.queryParamMap])
      .subscribe(([user, params]) => {
        this.user = user;
        this.companyId = params.get('companyId') || undefined;

        if (user) {
          user.role === 'admin' ? this.loadAdminTransactions() : this.loadHostTransactions();
        } 
        
      }
    );

  }

  loadHostTransactions() {
    if (this.companyId) {
      this.transactionService.getCompanyTransactions(this.companyId).subscribe(transactions => {
        this.transactions = transactions;
      });
    }
  }

  loadAdminTransactions() {
    this.transactionService.getAllTransactions().subscribe(transactions => {
      this.transactions = transactions;
      console.log(transactions);
    });
  }

}
