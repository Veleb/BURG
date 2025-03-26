import { Component, OnInit, OnDestroy } from '@angular/core';
import { VehicleService } from '../../../../vehicle/vehicle.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { VehicleInterface } from '../../../../../types/vehicle-types';
import { ProductCardComponent } from '../../../../vehicle/product-card/product-card.component';

@Component({
  selector: 'app-vehicles-view',
  imports: [ ProductCardComponent, RouterLink ],
  templateUrl: './vehicles-view.component.html',
  styleUrls: ['./vehicles-view.component.css']
})
export class VehiclesViewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  vehicles: VehicleInterface[] = [];
  loading = true;
  error: string | null = null;
  currentCompanyId?: string;

  constructor(
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.currentCompanyId = params.get('companyId') || undefined;
      this.loadVehicles();
    });
  }

  loadVehicles(): void {
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

  editVehicle(vehicleId: string): void {
    this.router.navigate(['/host/edit-vehicle', vehicleId], {
      queryParams: { companyId: this.currentCompanyId }
    });
  }

  deleteVehicle(vehicleId: string): void {
    const confirmation = prompt('Type "I AM SURE" to confirm deletion');
    if (confirmation?.toUpperCase() === 'I AM SURE') {
      this.vehicleService.deleteVehicle(vehicleId).subscribe({
        next: () => this.loadVehicles(),
        error: (err) => this.error = 'Failed to delete vehicle'
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}