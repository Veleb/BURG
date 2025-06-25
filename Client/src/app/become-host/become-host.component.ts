import { AfterViewInit, Component, ElementRef, inject, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
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
  location: string | undefined = undefined;

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

  onSubmitCompany(companyForm: NgForm): void {
    if (companyForm.valid) {
      const newCompanyData = { ...companyForm.value, companyLocation: this.location };

      this.hostService.createCompany(newCompanyData).subscribe({
        next: () => {
          this.toastr.success(`Sent host application`, `Success`);
          companyForm.reset();
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
