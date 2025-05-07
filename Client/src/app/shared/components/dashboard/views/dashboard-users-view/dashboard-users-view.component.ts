import { Component, inject, OnInit } from '@angular/core';
import { UserFromDB } from '../../../../../../types/user-types';
import { UserService } from '../../../../../user/user.service';
import { UserCardComponent } from '../../../../../user/user-card/user-card.component';

@Component({
  selector: 'app-dashboard-users-view',
  imports: [ UserCardComponent ],
  templateUrl: './dashboard-users-view.component.html',
  styleUrl: './dashboard-users-view.component.css'
})
export class DashboardUsersViewComponent implements OnInit {

  private userService = inject(UserService);

  users: UserFromDB[] = [];

  ngOnInit(): void {
    this.userService.getUsers().subscribe((users: UserFromDB[]) => {
      this.users = users;
    })
  }

}
