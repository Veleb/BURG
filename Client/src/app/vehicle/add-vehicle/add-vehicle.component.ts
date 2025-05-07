import { Component, inject, OnInit } from '@angular/core';
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

  companyId: string | null = null;
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

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
    vehicleImages: [''],
    vehicleRegistration: [''],
  };

  ngOnInit(): void {
    this.route.queryParamMap.subscribe({
      next: (params) => {
        this.companyId = params.get("companyId");
        this.updateVehicleDataCompany(); 
      }
    });
  }

  updateVehicleDataCompany(): void {
    if (this.companyId) {
      this.vehicleData.vehicleCompany = this.companyId;
    }
  }

  sizes = Object.values(Size);
  categories = Object.values(CategoryEnum);

  addImage() {
    this.vehicleData.vehicleImages.push('');
  }

  removeImage(index: number) {
    if (this.vehicleData.vehicleImages.length > 1) {
      this.vehicleData.vehicleImages.splice(index, 1);
    }
  }

  addRegistration() {
    this.vehicleData.vehicleRegistration.push('');
  }

  removeRegistration(index: number) {
    if (this.vehicleData.vehicleRegistration.length > 1) {
      this.vehicleData.vehicleRegistration.splice(index, 1);
    }
  }

  onSubmit(form: NgForm) { 
    if (form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.vehicleData.vehicleImages = this.vehicleData.vehicleImages
      .filter((url: string) => url.trim() !== '');

    this.vehicleService.createVehicle(this.vehicleData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        form.resetForm();
        this.vehicleData.vehicleImages = [''];
        this.toastr.success('Vehicle added successfully!', "Success");
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastr.error('Error while adding vehicle!', "Error Occurred");
      }
    });
  }
}
