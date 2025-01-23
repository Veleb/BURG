import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule, RouterLink ],
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
