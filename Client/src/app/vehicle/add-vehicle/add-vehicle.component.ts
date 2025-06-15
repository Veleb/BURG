import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { VehicleService } from '../vehicle.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Size, CategoryEnum } from '../../../types/enums';
import { VehicleForCreate } from '../../../types/vehicle-types';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-vehicle',
  imports: [FormsModule],
  templateUrl: './add-vehicle.component.html',
  styleUrl: './add-vehicle.component.css'
})

export class AddVehicleComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  vehicleData: VehicleForCreate = {
    vehicleCompany: '',
    vehicleName: '',
    vehicleModel: '',
    vehicleSize: Size.Small,
    vehicleCategory: CategoryEnum.Cars,
    vehiclePricePerDay: 0,
    vehiclePricePerKm: 0,
    vehicleYear: new Date().getFullYear(),
    vehicleEngine: '',
    vehiclePower: '',
    vehicleGvw: 0,
    vehicleFuelTank: 0,
    vehicleTyres: 4,
    vehicleMileage: 0,
    vehicleChassisType: '',
    vehicleCapacity: 0,
    identificationNumber: '',
    isPromoted: false,
    vehicleImages: [],
    vehicleRegistration: [],
  };

  @ViewChild('form') form!: NgForm;
  formSubmitted = false;
  
  companyId: string | null = null;
  isSubmitting = false;

  sizes = Object.values(Size);
  categories = Object.values(CategoryEnum);

  selectedImages: File[] = [];
  selectedRegistrations: File[] = [];

  currentYear = new Date().getFullYear();
  maxYear = this.currentYear + 1;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.companyId = params.get("companyId");
      if (this.companyId) {
        this.vehicleData.vehicleCompany = this.companyId;
      }
    });
  }

  onImagesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedImages = Array.from(files);
    }
  }

  onRegistrationSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedRegistrations = Array.from(files);
    }
  }

  onSubmit() {
    if (!this.vehicleData.vehicleCompany) {
      this.toastr.error("Company ID missing in query params");
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    const vehicleDataToSend = {
    ...this.vehicleData,
    vehicleSize: this.vehicleData.vehicleSize.toString(),
    vehicleCategory: this.vehicleData.vehicleCategory.toString()
  };
  
    formData.append('vehicleData', JSON.stringify(vehicleDataToSend));

    this.selectedImages.forEach(file => {
      formData.append('images', file);
    });

    this.selectedRegistrations.forEach(file => {
      formData.append('registrations', file);
    });

    this.vehicleService.createVehicle(formData).subscribe({
      next: () => {
        this.toastr.success('Vehicle created successfully!');
        this.isSubmitting = false;
        this.resetForm();
      },
      error: (err) => {
        this.toastr.error('Error creating vehicle. Please try again.');
        this.isSubmitting = false;
        console.error(err);
      }
    });
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
      vehicleTyres: 4,
      vehicleMileage: 0,
      vehicleChassisType: '',
      vehicleCapacity: 0,
      identificationNumber: '',
      vehicleImages: [],
      vehicleRegistration: [],
      isPromoted: false,
      vehiclePricePerDay: 0,
      vehiclePricePerKm: 0
    };
    this.selectedImages = [];
    this.selectedRegistrations = [];
  }
}
