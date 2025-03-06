import { AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
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

@Component({
    selector: 'app-register',
    imports: [FormsModule, RouterLink, PasswordDirective, RepassDirective, EmailDirective, FullnameDirective],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent implements AfterViewInit {

  @ViewChild('phoneInput', { static: true }) phoneInput!: ElementRef;
  iti: any;  

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

  onSubmit(formElement: NgForm): void {
    const formData = { ...formElement.value };

    const phoneNumber = this.iti.getNumber(); 
    
    if (phoneNumber && !this.iti.isValidNumber()) {
      this.toastr.error('Phone number is invalid!', 'Error occurred!');
      return;
    }

    formData.phoneNumber = phoneNumber; 

    if (formData.confirmPassword !== formData.password) {
      this.toastr.error('Passwords mismatch!', 'Error occurred!');
      return;
    }

    delete formData.confirmPassword; 

    this.userService.register(formData).subscribe({
      next: (response) => {
        this.toastr.success('Successful Register!', 'Success');
        this.router.navigate(['home']);
      },
      error: (error) => {
        console.error(`Error registering user: ${error.message}`);
        this.toastr.error('Registration failed. Please try again.', 'Error');
      }
    });

    formElement.reset();
  }
  
}
