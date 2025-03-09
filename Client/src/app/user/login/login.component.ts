import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import { EmailDirective } from '../../directives/email.directive';
import { PasswordDirective } from '../../directives/password.directive';

declare var google: any; // Declare google API globally for TypeScript to recognize it.

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, EmailDirective, PasswordDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  @ViewChild('googleButtonContainer', { static: true }) 
  googleButtonContainer!: ElementRef;
  
  constructor(private userService: UserService, private toastr: ToastrService, private router: Router) {}

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '1055909539687-a20hs61fm65nsahmtln1lnedji4v7e1e.apps.googleusercontent.com', // Removed trailing space
      callback: (response: any) => this.handleCredentialResponse(response)
    });
    
    // Add button rendering code
    google.accounts.id.renderButton(
      this.googleButtonContainer.nativeElement,
      { 
        type: 'icon',
        shape: 'circle',
        theme: 'outline',
        size: 'large'
      }
    );
  }

  onSubmit(formElement: NgForm): void {
    const formData = formElement.value;

    this.userService.login(formData).subscribe({
      next: (response) => {
        this.toastr.success(`Successful Login!`, `Success`);
        this.router.navigate(['home']);
      },
      error: (error) => {
        console.error(`Error logging in user: ${error}`);
      }
    });
    formElement.reset();
  }

  handleCredentialResponse(response: any): void {
    const idToken = response.credential;

    this.userService.googleLogin(idToken).subscribe({
      next: (response) => {
        this.toastr.success(`Google Login Successful!`, `Success`);
        this.router.navigate(['home']);
      },
      error: (error) => {
        console.error(`Error with Google login: ${error}`);
        this.toastr.error(`Google login failed`, `Error`);
      }
    });
  }
}
