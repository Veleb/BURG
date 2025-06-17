import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css'
})
export class PaginatorComponent {

  @Input() currentPage = 1;
  @Input() pageSize = 20;
  @Input() totalCount = 0;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  onPageChange(newPage: number): void {
    if (newPage < 1) newPage = 1;
    else if (newPage > this.totalPages) newPage = this.totalPages;

    if (newPage !== this.currentPage) {
      this.pageChange.emit(newPage);
    }
  }

}
