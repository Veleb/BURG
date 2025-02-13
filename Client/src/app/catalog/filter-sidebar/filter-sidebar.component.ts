import { Component } from '@angular/core';
import { DatepickerComponent } from "../../datepicker/datepicker.component";

@Component({
  selector: 'app-filter-sidebar',
  imports: [ DatepickerComponent ],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.css'
})
export class FilterSidebarComponent {

}
