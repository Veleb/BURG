import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Form Submitted!', form.value);
    }
  }

}
