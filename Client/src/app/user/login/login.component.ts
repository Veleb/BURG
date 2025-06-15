import { Component, ElementRef, inject, OnInit, ViewChild, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import { EmailDirective } from '../../directives/email.directive';
import { PasswordDirective } from '../../directives/password.directive';

declare const google: any; // Declare the global 'google' object for TypeScript

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, EmailDirective, PasswordDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  @ViewChild('googleButtonContainer', { static: true }) googleButtonContainer!: ElementRef;

  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // google.accounts.id.initialize({
    //   client_id: '1055909539687-a20hs61fm65nsahmtln1lnedji4v7e1e.apps.googleusercontent.com',
    //   callback: (response: { credential: string }) => this.handleCredentialResponse(response)
    // });

    // google.accounts.id.renderButton(
    //   this.googleButtonContainer.nativeElement,
    //   { 
    //     type: 'icon', 
    //     shape: 'circle', 
    //     theme: 'outline', 
    //     size: 'large',
    //     text: 'signin_with'
    //   }
    // );
      if (isPlatformBrowser(this.platformId)) {
        google.accounts.id.initialize({
          client_id: '1055909539687-a20hs61fm65nsahmtln1lnedji4v7e1e.apps.googleusercontent.com',
          callback: (response: { credential: string }) => this.handleCredentialResponse(response)
        });

        google.accounts.id.renderButton(
          this.googleButtonContainer.nativeElement,
          { 
            type: 'icon', 
            shape: 'circle', 
            theme: 'outline', 
            size: 'large',
            text: 'signin_with'
          }
        );
      }
  }
  
  handleCredentialResponse(response: { credential: string }): void {
    this.userService.googleAuth(response.credential).subscribe({
      next: (res) => {
        this.toastr.success('Google authentication successful!', 'Success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.handleGoogleError(err);
      }
    });
  }
  
  onSubmit(form: NgForm) {
    if (form.invalid) return;
  
    this.userService.login(form.value).subscribe({
      next: (res) => {
        this.toastr.success('Login successful!', 'Success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Login failed', 'Error Occurred');
      }
    });
  }

  private handleGoogleError(err: any) {
    const errorMessage = err.error?.code === 'EXISTING_EMAIL_ACCOUNT' 
      ? 'Email already registered with password' 
      : 'Google authentication failed';
      
    this.toastr.error(errorMessage, 'Error Occurred');
  }

}