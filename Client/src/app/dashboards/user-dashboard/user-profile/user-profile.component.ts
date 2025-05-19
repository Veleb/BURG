import { AfterViewChecked, Component, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { UserService } from '../../../user/user.service';
import { UserFromDB } from '../../../../types/user-types';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { ProductCardComponent } from '../../../vehicle/product-card/product-card.component';
import { EmailDirective } from '../../../directives/email.directive';
import { FullnameDirective } from '../../../directives/fullname.directive';
import { VehicleInterface } from '../../../../types/vehicle-types';
import { RentInterface } from '../../../../types/rent-types';
import { isPlatformBrowser } from '@angular/common';
import intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-user-profile',
  imports: [FormsModule, ProductCardComponent, EmailDirective, FullnameDirective],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, AfterViewChecked, OnDestroy {

  private userService = inject(UserService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID)
  
  private destroy$ = new Subject<void>();

  @ViewChild('phoneInput', { static: false }) phoneInput!: ElementRef;
  iti: intlTelInput.Plugin | undefined = undefined;  

  editMode: boolean = false;
  isUpdating: boolean = false;
  isLoading: boolean = true;

  user: UserFromDB | null = inject(ActivatedRoute).snapshot.data['user'];
  userRents: RentInterface[] = [];
  rentVehicles: VehicleInterface[] = [];
  editModel: Partial<UserFromDB> = {};
  likedVehicles: VehicleInterface[] = [];

  previewProfileImage: string | ArrayBuffer | null = null;
  previewBannerImage: string | ArrayBuffer | null = null;
  selectedProfileFile: File | null = null;
  selectedBannerFile: File | null = null;

  ngOnInit(): void {
  if (!this.user) {
    this.router.navigate(['/auth/login']);
    return;
  }

  this.editModel = { ...this.user };

  forkJoin([
    this.userService.getLikedVehicles().pipe(catchError(() => of([]))),
    this.userService.getRents().pipe(catchError(() => of([])))
  ])
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: ([vehicles, rents]) => {
      this.likedVehicles = vehicles;
      this.userRents = rents;
      this.rentVehicles = rents.map(r => r.vehicle as VehicleInterface);
      this.isLoading = false;
    },
    error: () => {
      this.toastr.error('Failed to load profile data', 'Error');
      this.isLoading = false;
    }
  });
}

  ngAfterViewChecked(): void {
    if (isPlatformBrowser(this.platformId) && this.phoneInput && !this.iti) {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // private loadUserData(): void {
  //   this.userService.getProfile().pipe(
  //     takeUntil(this.destroy$),
  //     switchMap(user => {

  //       if (!user) {
  //         this.router.navigate(['/auth/login']);
  //         return of([]);
  //       }

  //       this.user = user;
  //       this.editModel = { ...user };
        
  //       return forkJoin([
  //         this.userService.getLikedVehicles()
  //         .pipe(
  //           catchError(error => {
  //             return of([]);
  //           })
  //         ),
  //         this.userService.getRents().pipe(
  //           catchError(error => {
  //             return of([]);
  //           })
  //         )
  //       ]);
  //     }),
  //     catchError(error => {
  //       this.toastr.error('Failed to load profile data', 'Error Occurred');
  //       return of([]);
  //     })
  //   ).subscribe(([vehicles, rents]) => {
  //     this.likedVehicles = vehicles;
  //     this.userRents = rents;
  //     this.rentVehicles = rents.map(rent => rent.vehicle as VehicleInterface);
  //     this.isLoading = false;
  //   });
  // }

  onFileSelect(event: Event, type: 'profile' | 'banner'): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'profile') {
          this.previewProfileImage = reader.result;
          this.selectedProfileFile = file;
        } else {
          this.previewBannerImage = reader.result;
          this.selectedBannerFile = file;
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
  toggleEditMode() {
    if (this.editMode) {
      this.editModel = {};
    } else {
      this.editModel = { 
        fullName: this.user?.fullName,
        email: this.user?.email,
        phoneNumber: this.user?.phoneNumber
      };
    }
    this.editMode = !this.editMode;
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.user) return;

    this.isUpdating = true;

    const phoneNumber = this.iti?.getNumber();
    this.editModel.phoneNumber = phoneNumber;


    const formData = new FormData();

    formData.append('fullName', this.editModel.fullName ?? '');
    formData.append('email', this.editModel.email ?? '');
    formData.append('phoneNumber', form.value.phoneNumber ?? '');

    if (this.selectedProfileFile) {
      formData.append('profilePicture', this.selectedProfileFile);
    }
   
    if (this.selectedBannerFile) {
      formData.append('bannerImage', this.selectedBannerFile);
    }

    this.userService.updateProfile(formData).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
            this.toastr.error('Failed to update profile', 'Error Occurred');
            this.isUpdating = false;
            return of(null);
        })
    ).subscribe(response => {
        if (response) {
            this.user = response.user;
            this.editMode = false;
            this.toastr.success('Profile updated successfully', `Success`);
        }
        this.isUpdating = false;
    });
  }

  confirmLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.logout();
    }
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.toastr.success('Successfully logged out!', 'Success');
        this.router.navigate(['/']);
      },
      error: () => {
        this.toastr.error('Logout failed. Please try again.', 'Error Occurred');
      }
    });
  }

  deleteProfile(): void {
    this.userService.deleteProfile().subscribe({
      next: () => {
        this.toastr.success('Successfully deleted profile!', 'Success');
        this.router.navigate(['/']);
      },
      error: () => {
        this.toastr.error('Profile deletion failed. Please try again.', 'Error Occurred');
      }
    });
  }
}