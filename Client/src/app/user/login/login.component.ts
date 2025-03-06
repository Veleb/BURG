import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';
import { EmailDirective } from '../../directives/email.directive';
import { PasswordDirective } from '../../directives/password.directive';

@Component({
    selector: 'app-login',
    imports: [FormsModule, RouterLink, EmailDirective, PasswordDirective],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private userService: UserService, private toastr: ToastrService, private router: Router) {}

  onSubmit(formElement: NgForm): void {
    const formData = formElement.value;

    this.userService.login(formData).subscribe({
      next: (response) => {
        this.toastr.success(`Successful Login!`, `Success`);
        this.router.navigate(['home']);
      },
      error: (error) => {
        console.error(`Error registering user: ${{error}}`);
      }
    })
    formElement.reset();
  }

}
