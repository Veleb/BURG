import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatepickerComponent } from '../../datepicker/datepicker.component';
import { ImageCarouselComponent } from '../../shared/components/image-carousel/image-carousel.component';
import { ProductCardComponent } from '../../vehicle/product-card/product-card.component';
import { VehicleService } from '../../vehicle/vehicle.service';
import { VehicleInterface } from '../../../types/vehicle-types';

@Component({
    selector: 'app-hero',
    imports: [DatepickerComponent, ImageCarouselComponent, ProductCardComponent],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css'
})

export class HeroComponent implements OnInit {


    
  images: string[] = [
    "https://res.cloudinary.com/dye8fvmhy/image/upload/v1739015575/Tesla-model-s-2022_ofwei4.jpg",
    "https://res.cloudinary.com/dye8fvmhy/image/upload/v1739015574/tesla-model-s-lifestyle-image-2022_p2qfjm.jpg",
    "https://res.cloudinary.com/dye8fvmhy/image/upload/v1739015575/Tesla-model-s-2022_ofwei4.jpg",
    "https://res.cloudinary.com/dye8fvmhy/image/upload/v1739013818/traveller-1_swdnnq.jpg",
    "https://res.cloudinary.com/dye8fvmhy/image/upload/v1739015575/Tesla-model-s-2022_ofwei4.jpg",
  ]

  vehicles: VehicleInterface[] | undefined = undefined;

  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(
    private vehicleService: VehicleService,
    private router: Router,

  ) {}

  ngOnInit(): void {
    this.vehicleService.getAll()

    this.vehicleService.vehicles$.subscribe(vehicles => {
        this.vehicles = vehicles.slice(0, 4);
    });
  }

  onStartDateChange(newStartDate: Date | null): void {
    console.log(`start` + newStartDate);
    this.startDate = newStartDate;
  }
  
  onEndDateChange(newEndDate: Date | null): void {
    this.endDate = newEndDate;
  }

  onSearch(): void {

    this.router.navigate(['/catalog'], {
      queryParams: {
        start: this.startDate?.toISOString(),
        end: this.endDate?.toISOString()
      }
    });
  }

}
