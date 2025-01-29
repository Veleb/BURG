import { Component, Input } from '@angular/core';
import { VehicleInterface } from '../../../types/vehicle-types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  
  @Input() vehicle: VehicleInterface | undefined = undefined;

}
