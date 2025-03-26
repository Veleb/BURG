import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../user/user.service';
import { UserFromDB } from '../../../types/user-types';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { RentCardComponent } from '../../rents/rent-card/rent-card.component';
import { ProductCardComponent } from '../../vehicle/product-card/product-card.component';
import { EmailDirective } from '../../directives/email.directive';
import { FullnameDirective } from '../../directives/fullname.directive';
import { VehicleInterface } from '../../../types/vehicle-types';
import { RentInterface } from '../../../types/rent-types';

@Component({
  selector: 'app-user-dashboard',
  imports: [ FormsModule, RentCardComponent, ProductCardComponent, EmailDirective, FullnameDirective ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  editMode = false;
  isUpdating = false;
  isLoading = true;
  user: UserFromDB | null = null;
  editModel: Partial<UserFromDB> = {};
  likedVehicles: VehicleInterface[] = [];
  userRents: RentInterface[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.userService.getProfile().pipe(
      takeUntil(this.destroy$),
      switchMap(user => {
        this.user = user;
        this.editModel = { ...user };
        
        return forkJoin([
          this.userService.getLikedVehicles().pipe(
            catchError(error => {
              this.toastr.error('Failed to load saved vehicles', 'Error');
              return of([]);
            })
          ),
          this.userService.getRents().pipe(
            catchError(error => {
              this.toastr.error('Failed to load rent history', 'Error');
              return of([]);
            })
          )
        ]);
      }),
      catchError(error => {
        this.toastr.error('Failed to load profile data', 'Error');
        return of([]);
      })
    ).subscribe(([vehicles, rents]) => {
      this.likedVehicles = vehicles;
      this.userRents = rents; 
      this.isLoading = false;
    });
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

    this.userService.updateProfile(this.editModel).pipe(
        takeUntil(this.destroy$),
        catchError(error => {
            this.toastr.error('Failed to update profile', 'Error');
            this.isUpdating = false;
            return of(null);
        })
    ).subscribe(updatedUser => {
        if (updatedUser) {
            this.user = updatedUser;
            this.editMode = false;
            this.toastr.success('Profile updated successfully');
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
        this.router.navigate(['/home']);
      },
      error: () => {
        this.toastr.error('Logout failed. Please try again.', 'Error');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}