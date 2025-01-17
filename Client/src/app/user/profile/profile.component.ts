import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { UserFromDB } from '../../../types/user-types';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  constructor(private userService: UserService, private router: Router, private toastr: ToastrService) {}

  user: UserFromDB | null = null;

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.toastr.success('Successfully logged out!', 'Success!');
        this.router.navigate(['home']);
      },
      error: (error) => {
        this.toastr.error('Logout failed. Please try again.', 'Error');
      }
    });
  }
  

}
