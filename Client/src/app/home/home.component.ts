import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HeroComponent } from "./hero/hero.component";
import { VehicleService } from '../vehicle/vehicle.service';
import { VehicleInterface } from '../../types/vehicle-types';
import { environment } from '../../environments/environment';
import { UppercasePipe } from '../shared/pipes/uppercase.pipe';
import { Category } from '../../types/enums';
import { RouterLink } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { ProductCardComponent } from '../vehicle/product-card/product-card.component';

@Component({
    selector: 'app-home',
    imports: [HeroComponent, UppercasePipe, RouterLink, ProductCardComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

    private vehicleService = inject(VehicleService);

    private destroy$ = new Subject<void>();

    vehicles: VehicleInterface[] | undefined = undefined;
    categories: Category[] = environment.categories;

    ngOnInit(): void {

    this.vehicleService.getTotalCount().subscribe();

    this.vehicleService.totalCount$
        .pipe(
            takeUntil(this.destroy$),
            switchMap((totalCount) => {
                const maxOffset = Math.max(0, totalCount - 3);

                const offset = Math.floor(Math.random() * (maxOffset + 1));
                return this.vehicleService.getVehicles({ limit: 3, offset, promoted: false, sortByLikes: false });
            })
        )
        .subscribe(vehicleResponse => {
            this.vehicles = vehicleResponse.vehicles;
        });
}

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}
