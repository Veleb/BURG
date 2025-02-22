import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { VehicleInterface } from '../../../types/vehicle-types';
import { RouterLink } from '@angular/router';
import { CurrencyConverterPipe } from '../../shared/pipes/currency.pipe';
import { CurrencyService } from '../../currency/currency.service';
import { CurrencyPipe } from '@angular/common';
import { UppercasePipe } from '../../shared/pipes/uppercase.pipe';
import { VehicleService } from '../vehicle.service';
import { UserService } from '../../user/user.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-product-card',
    imports: [RouterLink, CurrencyConverterPipe, CurrencyPipe, UppercasePipe],
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnInit, OnChanges, OnDestroy {
  
  private destroy$ = new Subject<void>();

  @Input() vehicle: VehicleInterface | undefined = undefined;
  selectedCurrency: string = 'USD';
  currentIndex: number = 0;

  userId: string | null | undefined = undefined;

  hasLiked: boolean = false;

  constructor(
    private currencyService: CurrencyService,
    private vehicleService: VehicleService,
    private userService: UserService,
    private toastr: ToastrService,

  ) {}

  ngOnInit(): void {

    this.currencyService.getCurrency()
    .pipe(takeUntil(this.destroy$))
    .subscribe(currency => {
      this.selectedCurrency = currency;
    });

    this.userService.user$
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      this.userId = user?._id || null;
      this.updateHasLiked();
    });

  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vehicle']) {
      this.updateHasLiked();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateHasLiked(): void {
    if (this.vehicle?.likes && this.userId) {
      this.hasLiked = this.vehicle.likes.includes(this.userId);
    } else {
      this.hasLiked = false;
    }
  }

  nextSlide() {
    if (this.vehicle?.details?.images) {
      this.currentIndex = (this.currentIndex + 1) % this.vehicle.details.images.length;
    }
  }

  prevSlide() {
    if (this.vehicle?.details?.images) {
      this.currentIndex = (this.currentIndex - 1 + this.vehicle.details.images.length) % this.vehicle.details.images.length;
    }
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }

  onHeartIconClick(): void {
    if (!this.userId) {
      this.toastr.error(`Unauthorized!`, `Error Occurred!`)
      return;
    }

    if (!this.vehicle?._id) {
      this.toastr.error(`Vehicle not found!`, `Error Occurred!`)
      return;
    }
    
    if (this.hasLiked) {

      this.vehicleService.unlikeVehicle(this.vehicle._id).subscribe((data) => {
        this.hasLiked = false;

        if (this.vehicle) {
          this.vehicle.likes = this.vehicle.likes.filter(id => id !== this.userId);
        }

        this.toastr.success(`${data.message}`, `Success`);
      });
      
    } else {
      this.vehicleService.likeVehicle(this.vehicle._id).subscribe((data) => {
        this.hasLiked = true;

        if (this.vehicle && this.userId) {
          this.vehicle.likes = [...this.vehicle.likes, this.userId];
        }

        this.toastr.success(`${data.message}`, `Success`);
      });
    }
  }

}
