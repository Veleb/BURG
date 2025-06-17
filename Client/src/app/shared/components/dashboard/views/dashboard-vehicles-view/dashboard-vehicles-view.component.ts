import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, forkJoin, Subject, takeUntil } from 'rxjs';
import { VehicleInterface } from '../../../../../../types/vehicle-types';
import { VehicleService } from '../../../../../vehicle/vehicle.service';
import { UserFromDB } from '../../../../../../types/user-types';
import { ToastrService } from 'ngx-toastr';
import { ProductCardComponent } from '../../../../../vehicle/product-card/product-card.component';
import { UserService } from '../../../../../user/user.service';
import Papapa from 'papaparse';
import { PaginatorComponent } from '../../../paginator/paginator.component';

@Component({
  selector: 'app-dashboard-vehicles-view',
  imports: [RouterLink, ProductCardComponent, PaginatorComponent],
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
  currentPage: number = 1;
  pageSize: number = 20;
  totalCount: number = 0;

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

  // loadAllVehicles(): void {
  //   this.loading = true;
  //   this.vehicleService.getAll();

  //   this.vehicleService.vehicles$.subscribe({
  //     next: (vehicles) => {
  //       this.vehicles = vehicles;
  //       // console.log(vehicles);
        
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       this.error = 'Failed to load vehicles';
  //       this.loading = false;
  //       this.toastr.error(this.error, `Error Occurred`);
  //     }
  //   });
  // }

  loadAllVehicles(): void {
    this.loading = true;
    this.error = null;

    const offset = (this.currentPage - 1) * this.pageSize;

    forkJoin([
      this.vehicleService.getAll({ limit: this.pageSize, offset }),
      this.vehicleService.getTotalCount()
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ([vehiclesResponse, count]) => {
        this.vehicles = vehiclesResponse.vehicles;
        this.totalCount = count;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load vehicles';
        this.loading = false;
        this.toastr.error(this.error, 'Error Occurred');
      }
    });
  }

  editVehicle(vehicleId: string): void {
    this.router.navigate([`/dashboard/host/edit-vehicle`], {
      queryParams: { vehicleId: vehicleId }
    });
  }

  deleteVehicle(vehicleId: string): void {
    const confirmation = prompt('Type "I AM SURE" to confirm deletion');
    if (confirmation?.toUpperCase() === 'I AM SURE') {
      this.vehicleService.deleteVehicle(vehicleId).subscribe({
        next: () => {
          this.currentPage = 1;
          
          this.user?.role === 'host' ? this.loadCompanyVehicles() : this.loadAllVehicles();
          
          this.toastr.success('Vehicle deleted successfully', 'Success');
        },
        error: (err) => {
          this.error = 'Failed to delete vehicle';
          this.toastr.error(this.error, "Error Occurred");
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (!input.files || input.files.length === 0) {
      return;
    }
  
    const file = input.files[0];
    
    const reader = new FileReader();
  
    reader.onload = () => {
      const csvText = reader.result as string;
      
      this.processCSV(csvText);
    };
  
    reader.readAsText(file);
  }

  processCSV(csvText: string): void {
    const parsed = Papapa.parse(csvText, {
      header: true,
      delimiter: ',',
      skipEmptyLines: true,
      transformHeader: (header) => header.replace(/^\ufeff/, ''),
      transform: (value) => value.trim(),
    });
  
    const vehicles = parsed.data.map((row: any) => {
      const vehicle: any = {
        company: row.company,
        available: row.available?.toLowerCase() === 'true',
        details: {}
      };
  
      Object.keys(row).forEach(key => {
        if (key.startsWith('details.')) {
          const detailKey = key.split('.')[1];
          const value = row[key];
          
          if (['images', 'vehicleRegistration'].includes(detailKey)) {
            vehicle.details[detailKey] = value 
              ? value.split(',').map((url: string) => url.trim()) 
              : [];
          } else {
            vehicle.details[detailKey] = isNaN(Number(value)) 
              ? value 
              : Number(value);
          }
        }
      });
  
      return vehicle;
    });
  
    this.vehicleService.bulkCreateVehicles(vehicles)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => this.toastr.success('Vehicles uploaded successfully', "Success"),
      error: () => this.toastr.error('Failed to upload vehicles', "Error Occurred")
    });
  }

  onPageChange(newPage: number): void {
    if (newPage < 1) newPage = 1;
    else if (newPage > this.totalPages) newPage = this.totalPages;

    if (newPage === this.currentPage) return;

    this.currentPage = newPage;
    this.loadAllVehicles();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
