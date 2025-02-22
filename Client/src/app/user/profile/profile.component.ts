import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { UserFromDB } from '../../../types/user-types';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RentCardComponent } from '../../rents/rent-card/rent-card.component';
import { VehicleInterface } from '../../../types/vehicle-types';
import { catchError, of, Subject, switchMap, takeUntil } from 'rxjs';
import { ProductCardComponent } from "../../vehicle/product-card/product-card.component";

@Component({
    selector: 'app-profile',
    imports: [RentCardComponent, ProductCardComponent],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {

  constructor(private userService: UserService, private router: Router, private toastr: ToastrService) {}

  user: UserFromDB | null = null;
  likedVehicles: VehicleInterface[] = []

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.userService.getProfile().pipe(
      takeUntil(this.destroy$),
      switchMap(user => {
        this.user = user;
        
        if (user) {
          return this.userService.getLikedVehicles().pipe(
            catchError(error => {
              console.error('Error fetching liked vehicles:', error);
              return of([]);
            })
          );
        }
        return of([]); 
      }),
      catchError(error => {
        console.error('Error fetching profile:', error);
        return of([]);
      })
    ).subscribe(likedVehicles => {
      this.likedVehicles = likedVehicles;
    });
  }
  
  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.toastr.success('Successfully logged out!', 'Success!');
        this.router.navigate(['home']);
      },
      error: (error) => {
        this.toastr.error('Logout failed. Please try again.', 'Error');
      }
    });
  }
    
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
