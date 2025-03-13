import { Component } from '@angular/core';
import { CompanyForPartner } from '../../types/company-types';
import { UserForPartner } from '../../types/user-types';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-become-host',
  imports: [ FormsModule ],
  templateUrl: './become-host.component.html',
  styleUrl: './become-host.component.css'
})
export class BecomeHostComponent {

  activeForm: 'company' | 'individual' = 'company';

  companyModel: CompanyForPartner = {
    companyName: '',
    companyEmail: '',
    companyPhoneNumber: '',
    companyLocation: '',
    vehicles: 0
  };

  individualModel: UserForPartner = {
    fullName: '',
    email: '',
    phone: '',
    vehicles: 0
  };

  submittedCompany = false;
  submittedIndividual = false;

  onSubmitCompany(form: any): void {
    this.submittedCompany = true;
    if (form.valid) {
      console.log('Company Registration Data:', this.companyModel);
      // TODO: Call your backend service to process company registration
    } else {
      console.warn('Company form is invalid.');
    }
  }

  // Submit handler for Individual form
  onSubmitIndividual(form: any): void {
    this.submittedIndividual = true;
    if (form.valid) {
      console.log('Individual Registration Data:', this.individualModel);
      // TODO: Call your backend service to process individual registration
    } else {
      console.warn('Individual form is invalid.');
    }
  }
}
