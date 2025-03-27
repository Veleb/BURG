import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { VehicleInterface } from '../../../../../../types/vehicle-types';
import { VehicleService } from '../../../../../vehicle/vehicle.service';
import { UserFromDB } from '../../../../../../types/user-types';
import { ToastrService } from 'ngx-toastr';
import { ProductCardComponent } from '../../../../../vehicle/product-card/product-card.component';
import { UserService } from '../../../../../user/user.service';

@Component({
  selector: 'app-dashboard-vehicles-view',
  imports: [RouterLink, ProductCardComponent],
  templateUrl: './dashboard-vehicles-view.component.html',
  styleUrl: './dashboard-vehicles-view.component.css'
})
export class DashboardVehiclesViewComponent {
  private vehicleService = inject(VehicleService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  
  private destroy$ = new Subject<void>();
  
  vehicles: VehicleInterface[] = [];
  loading = true;
  error: string | null = null;
  currentCompanyId?: string;
  user: UserFromDB | null = null; 

  ngOnInit(): void {
    this.userService.getProfile().subscribe();
    this.vehicleService.getAll();

    combineLatest([this.userService.user$, this.route.queryParamMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([user, params]) => {
        this.user = user;
        this.currentCompanyId = params.get('companyId') || undefined;

        if (user) {
          user.role === 'host' ? this.loadCompanyVehicles() : this.loadAllVehicles();
        } else {
          this.error = 'User not logged in';
          this.loading = false;
        }
      });
  }

  loadCompanyVehicles(): void {
    if (!this.currentCompanyId) {
      this.error = 'No company selected';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.vehicleService.getCompanyVehicles(this.currentCompanyId).subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load vehicles';
        this.loading = false;
      }
    });
  }

  loadAllVehicles(): void {
    this.vehicleService.vehicles$.subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load vehicles';
        this.loading = false;
        this.toastr.error(this.error, `Error Occurred`);
      }
    });
  }

  editVehicle(vehicleId: string): void {
    this.router.navigate([`/host/edit-vehicle`, vehicleId], {
      queryParams: { companyId: this.currentCompanyId }
    });
  }

  deleteVehicle(vehicleId: string): void {
    const confirmation = prompt('Type "I AM SURE" to confirm deletion');
    if (confirmation?.toUpperCase() === 'I AM SURE') {
      this.vehicleService.deleteVehicle(vehicleId).subscribe({
        next: () => {
          this.user?.role === 'host' ? this.loadCompanyVehicles() : this.loadAllVehicles();
        },
        error: (err) => this.error = 'Failed to delete vehicle'
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
