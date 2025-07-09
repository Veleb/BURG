import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Size, CategoryEnum } from '../../../types/enums';
import { VehicleForCreate, VehicleInterface, } from '../../../types/vehicle-types';
import { VehicleService } from '../vehicle.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, distinctUntilChanged, EMPTY, Observable, shareReplay, Subject, switchMap, takeUntil, } from 'rxjs';

@Component({
  selector: 'app-edit-vehicle',
  imports: [FormsModule],
  templateUrl: './edit-vehicle.component.html',
  styleUrl: './edit-vehicle.component.css',
})
export class EditVehicleComponent implements OnInit, OnDestroy {
  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  private destroy$ = new Subject<void>();
  private vehicleCache = new Map<string, Observable<VehicleInterface>>();

  isSubmitting: boolean = false;
  vehicle: VehicleInterface | undefined = undefined;
  sizes = Object.values(Size);
  categories = Object.values(CategoryEnum);

  selectedImages: File[] = [];
  selectedRegistrations: File[] = [];

  private initializeFormData(vehicle: VehicleInterface) {
    this.vehicleData = {
      vehicleCompany: vehicle?.company._id || '',
      vehicleName: vehicle?.details.name || '',
      vehicleModel: vehicle?.details.model || '',
      vehicleSize: vehicle?.details.size || Size.Small,
      vehicleCategory: vehicle?.details.category || CategoryEnum.Travel,
      vehiclePricePerDay: vehicle?.details.pricePerDay || 0,
      vehiclePricePerKm: vehicle?.details.pricePerKm || 0,
      vehicleYear: vehicle?.details.year || new Date().getFullYear(),
      vehicleEngine: vehicle?.details.engine || '',
      vehiclePower: vehicle?.details.power || '',
      vehicleGvw: vehicle?.details.gvw || 0,
      vehicleFuelTank: vehicle?.details.fuelTank || 0,
      vehicletires: vehicle?.details.tires || 4,
      vehicleMileage: vehicle?.details.mileage || 0,
      vehicleChassisType: vehicle?.details.chassisType || '',
      vehicleCapacity: vehicle?.details.capacity || 0,
      identificationNumber: vehicle?.details.identificationNumber || '',
      isPromoted: vehicle?.details.isPromoted || false,
      isLeased : vehicle?.details.isLeased || false,
      vehicleImages: [...vehicle.details.images],
      vehicleRegistration: [...vehicle.details.vehicleRegistration],
      summaryPdf: vehicle?.details.summaryPdf || '',
      slug: vehicle?.details.slug || '',
    };
  }

  vehicleData: VehicleForCreate = {
    vehicleCompany: '',
    vehicleName: '',
    vehicleModel: '',
    vehicleSize: Size.Small,
    vehicleCategory: CategoryEnum.Travel,
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
    isLeased: false,
    vehicleImages: [''],
    vehicleRegistration: [''],
    summaryPdf: '',
  };

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        distinctUntilChanged(
          (a, b) => a.get('vehicleId') === b.get('vehicleId')
        ),
        switchMap((params) => {
          const vehicleId = params.get('vehicleId');

          if (!vehicleId) {
            this.vehicle = undefined;
            return EMPTY;
          }

          if (!this.vehicleCache.has(vehicleId)) {
            this.vehicleCache.set(
              vehicleId,
              this.vehicleService
                .getVehicleById(vehicleId)
                .pipe(shareReplay(1), takeUntil(this.destroy$))
            );
          }

          return this.vehicleCache.get(vehicleId)!;
        }),
        catchError((error) => {
          this.toastr.error('Error loading vehicle', `Error Occurred`);
          return EMPTY;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((vehicle) => {
        this.vehicle = vehicle;
        this.initializeFormData(vehicle);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  onSubmit(form: NgForm) {
    if (form.invalid || this.isSubmitting || !this.vehicle?._id) return;

    this.isSubmitting = true;

    const formData = new FormData();

    formData.append('vehicleData', JSON.stringify(this.vehicleData));

    this.selectedImages.forEach((file) => {
      formData.append('vehicleImages', file);
    });

    this.selectedRegistrations.forEach((file) => {
      formData.append('vehicleRegistration', file);
    });

    this.vehicleService
      .updateVehicle(this.vehicle?._id, this.vehicleData)
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.toastr.success('Vehicle updated successfully!', 'Success');
          form.resetForm();
          this.vehicleData.vehicleImages = [''];
          this.vehicleData.vehicleRegistration = [''];
        },
        error: (err) => {
          this.toastr.error('Error while updating vehicle!', 'Error Occurred');
          this.isSubmitting = false;
        },
      });
  }
}