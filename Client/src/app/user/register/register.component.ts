import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ FormsModule, RouterLink ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {

  constructor(private userService: UserService, private toastr: ToastrService, private router: Router) {}

  onSubmit(formElement: NgForm): void {
    const formData = { ...formElement.value };
    delete formData.confirmPassword;
    console.log(formData);
  
    this.userService.register(formData).subscribe({
      next: (response) => {
        this.toastr.success(`Successful Register!`, `Success`);
        this.router.navigate(['home']);
      },
      error: (error) => {
        console.error(`Error registering user: ${error.message}`);
        this.toastr.error('Registration failed. Please try again.', 'Error');
      }
    });
  
    // formElement.reset();
  }
}