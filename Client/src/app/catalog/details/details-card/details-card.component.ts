import { Component, Input } from '@angular/core';
import { VehicleInterface } from '../../../../types/vehicle-types';
import { DatePipe } from '../../../shared/pipes/date.pipe';

@Component({
  selector: 'app-details-card',
  standalone: true,
  imports: [ DatePipe ],
  templateUrl: './details-card.component.html',
  styleUrl: './details-card.component.css'
})
export class DetailsCardComponent {
  @Input() vehicle: VehicleInterface | undefined = undefined;
}
