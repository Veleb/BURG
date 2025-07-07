import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { VehicleService } from '../vehicle.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Size, CategoryEnum } from '../../../types/enums';
import {
  VehicleForCreate,
  VehicleInterface,
} from '../../../types/vehicle-types';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { CompanyService } from '../../company/company.service';
import { EMPTY, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-vehicle',
  imports: [FormsModule],
  templateUrl: './add-vehicle.component.html',
  styleUrl: './add-vehicle.component.css',
})
export class AddVehicleComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private CompanyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  private destroy$ = new Subject<void>();

  vehicleData: VehicleForCreate = {
    vehicleCompany: '',
    vehicleName: '',
    vehicleModel: '',
    vehicleSize: Size.Small,
    vehicleCategory: CategoryEnum.Trucks,
    vehiclePricePerDay: 0,
    vehiclePricePerKm: 0,
    vehicleYear: new Date().getFullYear(),
    vehicleEngine: '',
    vehiclePower: '',
    vehicleGvw: 0,
    vehicleFuelTank: 0,
    vehicletires: 4,
    vehicleMileage: 0,
    vehicleChassisType: '',
    vehicleCapacity: 0,
    identificationNumber: '',
    isPromoted: false,
    vehicleImages: [],
    vehicleRegistration: [],
    summaryPdf: '',
  };

  showSummaryModal = false;
  submittedVehicle: VehicleInterface | undefined = undefined;

  @ViewChild('form') form!: NgForm;
  formSubmitted = false;

  companySlug: string | null = null;
  isSubmitting = false;

  sizes = Object.values(Size);
  categories = Object.values(CategoryEnum);

  selectedImages: File[] = [];
  selectedRegistrations: File[] = [];

  vehicleImagesError = false;
  registrationImageError = false;

  registrationModel: FileList | null = null;
  vehicleImageModel: FileList | null = null;

  currentYear = new Date().getFullYear();
  maxYear = this.currentYear + 1;

  onVehicleImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.vehicleImageModel = input.files;
    this.selectedImages = input.files ? Array.from(input.files) : [];
    this.vehicleImagesError = this.selectedImages.length < 1;
  }

  onRegistrationImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.registrationModel = input.files;
    this.selectedRegistrations = input.files ? Array.from(input.files) : [];
    this.registrationImageError = this.selectedRegistrations.length < 1;
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params: ParamMap) => {
          this.companySlug = params.get('companySlug');

          if (!this.companySlug) {
            this.toastr.error('Company slug missing in query params');
            return EMPTY;
          }

          return this.CompanyService.getCompanyBySlug(this.companySlug);
        })
      )
      .subscribe({
        next: (company) => {
          if (company) {
            this.vehicleData.vehicleCompany = company._id;
          } else {
            this.toastr.error('Company not found');
          }
        },
        error: (err) => {
          this.toastr.error('Error fetching company details');
          console.error(err);
        },
      });

    (pdfMake as any).default.vfs = pdfFonts.vfs;
  }

  onImagesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedImages = Array.from(files);
      this.vehicleData.vehicleImages = this.selectedImages;
    }
  }

  onRegistrationSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedRegistrations = Array.from(files);
      this.vehicleData.vehicleRegistration = this.selectedRegistrations;
    }
  }

  async onSubmit() {
    this.vehicleImagesError = this.selectedImages.length < 5;
    this.registrationImageError = !this.selectedRegistrations;

    if (this.vehicleImagesError || this.registrationImageError) {
      return;
    }

    if (!this.vehicleData.vehicleCompany) {
      this.toastr.error('Company ID missing in query params');
      return;
    }

    this.isSubmitting = true;
    this.formSubmitted = true;

    const formData = new FormData();

    const vehicleDataToSend = {
      ...this.vehicleData,
      vehicleSize: this.vehicleData.vehicleSize.toString(),
      vehicleCategory: this.vehicleData.vehicleCategory.toString(),
    };

    formData.append('vehicleData', JSON.stringify(vehicleDataToSend));

    this.selectedImages.forEach((file) => formData.append('images', file));
    this.selectedRegistrations.forEach((file) =>
      formData.append('registrations', file)
    );

    try {
      this.vehicleService.createVehicle(formData).subscribe({
        next: (vehicle: VehicleInterface) => {
          this.toastr.success('Vehicle created successfully!');
          this.isSubmitting = false;
          this.submittedVehicle = vehicle;
          this.showSummaryModal = true;

          // 🔽 Trigger download of the generated PDF
          this.vehicleService.generateSummaryPDF(vehicle).subscribe({
            next: (pdfBlob) => {
              const url = window.URL.createObjectURL(pdfBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${vehicle.details?.name}_summary.pdf`;
              a.click();
              URL.revokeObjectURL(url);
            },
            error: (err) => {
              this.toastr.error('Failed to download summary PDF');
              console.error(err);
            },
          });

          this.resetForm();
        },
        error: (err) => {
          this.toastr.error('Error creating vehicle. Please try again.');
          this.isSubmitting = false;
          console.error(err);
        },
      });
    } catch (err) {
      this.toastr.error('Failed to create vehicle');
      this.isSubmitting = false;
      console.error(err);
    }
  }


  resetForm() {
    this.form.resetForm();
    this.formSubmitted = false;

    this.vehicleData = {
      ...this.vehicleData,
      vehicleName: '',
      vehicleModel: '',
      vehicleEngine: '',
      vehiclePower: '',
      vehicleGvw: 0,
      vehicleFuelTank: 0,
      vehicletires: 4,
      vehicleMileage: 0,
      vehicleChassisType: '',
      vehicleCapacity: 0,
      identificationNumber: '',
      vehicleImages: [],
      vehicleRegistration: [],
      isPromoted: false,
      vehiclePricePerDay: 0,
      vehiclePricePerKm: 0,
    };
    this.selectedImages = [];
    this.selectedRegistrations = [];
  }

  closeModal() {
    this.showSummaryModal = false;
  }
}
