import { AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import intlTelInput from 'intl-tel-input';
import { isPlatformBrowser } from '@angular/common';
import { PasswordDirective } from '../../directives/password.directive';
import { RepassDirective } from '../../directives/repass.directive';
import { EmailDirective } from '../../directives/email.directive';
import { FullnameDirective } from '../../directives/fullname.directive';

declare const google: any; // Declare google globally to avoid TypeScript errors

@Component({
    selector: 'app-register',
    imports: [FormsModule, RouterLink, PasswordDirective, RepassDirective, EmailDirective, FullnameDirective],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent implements AfterViewInit, OnInit {

  @ViewChild('phoneInput', { static: true }) phoneInput!: ElementRef;
  @ViewChild('googleRegisterButtonContainer', { static: true }) googleRegisterButtonContainer!: ElementRef;
  iti: intlTelInput.Plugin | undefined = undefined;  

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.iti = intlTelInput(this.phoneInput.nativeElement, {
        initialCountry: 'us',
        nationalMode: false,
        autoPlaceholder: 'aggressive',
        formatOnDisplay: true,
        utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
        preferredCountries: ['us', 'gb', 'ca'],
      });
    }
  }

  ngOnInit(): void {
    // google.accounts.id.initialize({
    //   client_id: '1055909539687-a20hs61fm65nsahmtln1lnedji4v7e1e.apps.googleusercontent.com',
    //   callback: (response: any) => this.handleCredentialResponse(response)
    // });

    // google.accounts.id.renderButton(
    //   this.googleRegisterButtonContainer.nativeElement,
    //   { 
    //     type: 'icon', 
    //     shape: 'circle', 
    //     theme: 'outline', 
    //     size: 'large',
    //     text: 'signup_with'
    //   }
    // );
    if (isPlatformBrowser(this.platformId)) {
      google.accounts.id.initialize({
        client_id: '1055909539687-a20hs61fm65nsahmtln1lnedji4v7e1e.apps.googleusercontent.com',
        callback: (response: any) => this.handleCredentialResponse(response)
      });

      google.accounts.id.renderButton(
        this.googleRegisterButtonContainer.nativeElement,
        { 
          type: 'icon', 
          shape: 'circle', 
          theme: 'outline', 
          size: 'large',
          text: 'signup_with'
        }
      );
    }
  }

  handleCredentialResponse(response: any): void {
    this.userService.googleAuth(response.credential).subscribe({
      next: (res) => {
        this.toastr.success('Google registration successful!', 'Success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.handleGoogleError(err);
      }
    });
  }

  onSubmit(form: NgForm) {

    const formData = form.value;

    const phoneNumber = this.iti ? this.iti.getNumber() : null; 
    
    if (phoneNumber && this.iti && !this.iti.isValidNumber()) {
      this.toastr.error('Phone number is invalid!', 'Error Occurred');
      return;
    }

    formData.phoneNumber = phoneNumber; 

    if (formData.confirmPassword !== formData.password) {
      this.toastr.error('Passwords mismatch!', 'Error Occurred');
      return;
    }

    delete formData.confirmPassword; 

    this.userService.register(formData).subscribe({
      next: (res) => {
        this.toastr.success('Registration successful!', 'Success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.toastr.error(
          err.error?.message || 'Registration failed', 
          'Error'
        );
      }
    });
  }

  private handleGoogleError(err: any) {
    const errorMessage = err.error?.code === 'EXISTING_EMAIL_ACCOUNT' 
      ? 'Account already exists. Please login instead' 
      : 'Google registration failed';
      
    this.toastr.error(errorMessage, 'Error Occurred');
  }


}
