import { Component, Input } from '@angular/core';
import { CertificateInterface } from '../../../types/certificate-types';
import { DatePipe } from '../../shared/pipes/date.pipe';

@Component({
  selector: 'app-certificate-card',
  imports: [ DatePipe ],
  templateUrl: './certificate-card.component.html',
  styleUrl: './certificate-card.component.css'
})
export class CertificateCardComponent {

  @Input() certificate: CertificateInterface | undefined = undefined;

}
