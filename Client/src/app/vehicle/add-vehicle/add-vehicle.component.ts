import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { VehicleService } from '../vehicle.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Size, CategoryEnum } from '../../../types/enums';
import { VehicleForCreate, VehicleInterface } from '../../../types/vehicle-types';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

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
    vehicleCategory: CategoryEnum.Trucks,
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
    summaryPdf: ''
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

  currentYear = new Date().getFullYear();
  maxYear = this.currentYear + 1;

  ngOnInit(): void {
    
    this.route.queryParamMap.subscribe(params => {
      this.companySlug = params.get("companySlug");
      if (this.companySlug) {
        this.vehicleData.vehicleCompany = this.companySlug;
      }
    });
    
    (pdfMake as any).default.vfs = pdfFonts.vfs;

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

  generateVehiclePDF(data: VehicleForCreate): Promise<Blob> {
    const docDefinition = {
      content: [
        { text: 'Vehicle Listing Confirmation', style: 'header' },
        { text: `\nCompany: ${data.vehicleCompany ?? ''}` },
        { text: `Name: ${data.vehicleName}` },
        { text: `Model: ${data.vehicleModel}` },
        { text: `Year: ${data.vehicleYear}` },
        { text: `Engine: ${data.vehicleEngine}` },
        { text: `Power: ${data.vehiclePower}` },
        { text: `VIN: ${data.identificationNumber}` },
        { text: `GVW: ${data.vehicleGvw} kg` },
        { text: `Fuel Tank: ${data.vehicleFuelTank} L` },
        { text: `Tyres: ${data.vehicleTyres}` },
        { text: `Mileage: ${data.vehicleMileage} km` },
        { text: `Chassis: ${data.vehicleChassisType}` },
        { text: `Capacity: ${data.vehicleCapacity} kg` },
        { text: `Size: ${data.vehicleSize}` },
        { text: `Category: ${data.vehicleCategory}` },
        { text: `Price/Day: $${data.vehiclePricePerDay}` },
        { text: `Price/KM: $${data.vehiclePricePerKm}` },
        { text: `Promoted: ${data.isPromoted ? 'Yes' : 'No'}` },
        { text: `\nThank you for listing your vehicle with us!`, style: 'footer' }
      ],
      styles: {
        header: { fontSize: 18, bold: true, marginBottom: 10 },
        footer: { marginTop: 20, italics: true }
      }
    };

    return new Promise((resolve, reject) => {
      pdfMake.createPdf(docDefinition).getBlob((blob: Blob | null) => {
        if (blob) resolve(blob);
        else reject(new Error('PDF generation failed'));
      });
    });
  }



  async onSubmit() {
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

    this.selectedImages.forEach(file => formData.append('images', file));
    this.selectedRegistrations.forEach(file => formData.append('registrations', file));

    try {
      const pdfBlob = await this.generateVehiclePDF(vehicleDataToSend);
      formData.append('summaryPdf', pdfBlob, `${vehicleDataToSend.vehicleName}_Summary.pdf`);

      this.vehicleService.createVehicle(formData).subscribe({
        next: (vehicle) => {
          this.toastr.success('Vehicle created successfully!');
          this.isSubmitting = false;
          this.submittedVehicle = vehicle;
          
          this.showSummaryModal = true;
          this.resetForm();
        },
        error: (err) => {
          this.toastr.error('Error creating vehicle. Please try again.');
          this.isSubmitting = false;
          console.error(err);
        }
      });
    } catch (err) {
      this.toastr.error('Failed to generate summary PDF');
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
  
  closeModal() {
    this.showSummaryModal = false;
  }
}
