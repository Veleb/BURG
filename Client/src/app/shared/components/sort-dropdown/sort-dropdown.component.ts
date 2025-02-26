import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-sort-dropdown',
  imports: [],
  templateUrl: './sort-dropdown.component.html',
  styleUrl: './sort-dropdown.component.css'
})
export class SortDropdownComponent {
  @Output() sortChanged = new EventEmitter<string>();

  @ViewChild('dropdown') dropdown!: ElementRef<HTMLSelectElement>;

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.sortChanged.emit(value);
  }

}
