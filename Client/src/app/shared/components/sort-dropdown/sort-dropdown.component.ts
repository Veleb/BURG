import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-sort-dropdown',
  imports: [],
  templateUrl: './sort-dropdown.component.html',
  styleUrl: './sort-dropdown.component.css'
})
export class SortDropdownComponent {
  @Input() mode: 'catalog' | 'dashboard' = 'catalog';
  @Output() sortChanged = new EventEmitter<string>();

  @ViewChild('dropdown') dropdown!: ElementRef<HTMLSelectElement>;

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.sortChanged.emit(value);
  }

}
