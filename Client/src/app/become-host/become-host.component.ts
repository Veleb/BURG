import { AfterViewInit, Component, ElementRef, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HostService } from '../services/host.service';
import { ToastrService } from 'ngx-toastr';
import { EmailDirective } from '../directives/email.directive';
import { isPlatformBrowser } from '@angular/common';
import intlTelInput from 'intl-tel-input';
import { LocationPickerComponent } from '../shared/components/location-picker/location-picker.component';

@Component({
  selector: 'app-become-host',
  imports: [ FormsModule, EmailDirective, LocationPickerComponent ],
  templateUrl: './become-host.component.html',
  styleUrl: './become-host.component.css'
})
export class BecomeHostComponent implements AfterViewInit {

  private hostService = inject(HostService);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);
  
  iti: any;  

  @ViewChild('phoneInput', { static: true }) phoneInput!: ElementRef;
  @ViewChild(LocationPickerComponent) locationPickerComponent!: LocationPickerComponent;

  location: string | undefined = undefined;

  selectedRegistrations: File[] = [];
  registrationImageError = false;
  registrationModel: FileList | null = null;

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

  onLocationSelected(location: string) {
    this.location = location;
  }

  onRegistrationImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.registrationModel = input.files;
    this.selectedRegistrations = input.files ? Array.from(input.files) : [];
    this.registrationImageError = this.selectedRegistrations.length < 1;
  }

  onSubmitCompany(companyForm: NgForm): void {
    if (companyForm.valid) {

      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      if (!this.iti.isValidNumber()) {
        this.toastr.error('Invalid phone number', 'Error');
        return;
      }

      const formattedPhoneNumber = this.iti.getNumber(intlTelInputUtils.numberFormat.E164);
      
      const formData = new FormData();
      
      formData.append('companyName', companyForm.value.companyName);
      formData.append('companyEmail', companyForm.value.companyEmail);
      formData.append('companyPhone', formattedPhoneNumber);
      formData.append('companyLocation', companyForm.value.companyLocation);
      formData.append('companyType', companyForm.value.companyType);
      formData.append('stateRegistration', companyForm.value.stateRegistration);

      for (const file of this.selectedRegistrations) {
        formData.append('registrationImages', file);
      }

      this.hostService.createCompany(formData).subscribe({
        next: () => {
          this.toastr.success(`Sent host application`, `Success`);
          companyForm.reset();
          this.locationPickerComponent.reset();        
        },
        error: () => {
          this.toastr.error(`Error occurred while sending host application`, `Error Occurred`)
        }
      })
    } else {
      this.toastr.error(`Form is invalid`, `Error Occurred`);
    }
  }

}
