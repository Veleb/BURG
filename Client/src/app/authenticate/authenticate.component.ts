import { Component, OnInit } from '@angular/core';
import { UserService } from '../user/user.service';
import { LoaderComponent } from '../shared/components/loader/loader.component';

@Component({
    selector: 'app-authenticate',
    imports: [LoaderComponent],
    templateUrl: './authenticate.component.html',
    styleUrl: './authenticate.component.css'
})
export class AuthenticateComponent implements OnInit {
  isAuthenticating: boolean = true;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.isAuthenticating = false;
      },
      error: () => {
        this.isAuthenticating = false;
      }
    });

    this.userService.user$.subscribe({
      next: () => {
        this.isAuthenticating = false;
      },
      error: () => {
        this.isAuthenticating = false;
      }
    });
  }
}
