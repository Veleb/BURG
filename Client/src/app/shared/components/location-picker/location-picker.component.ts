import {
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
  Input,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Subject,
  debounceTime,
  switchMap,
  takeUntil,
  distinctUntilChanged
} from 'rxjs';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.css',
})
export class LocationPickerComponent implements OnDestroy {
  private locationService = inject(LocationService);
  private destroy$ = new Subject<void>();

  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  @Output() locationSelected = new EventEmitter<{ text: string; lat: number; lng: number }>();
  @Input() layoutType = 'default';

  searchQuery = '';
  suggestions: { description: string; place_id: string }[] = [];

  private searchQuery$ = new Subject<string>();

  constructor() {
    this.searchQuery$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(), 
        switchMap(query => {
          if (query.length < 3) return []; 
          return this.locationService.autocompleteLocation(query);
        })
      )
      .subscribe({
        next: predictions => this.suggestions = predictions,
        error: () => this.suggestions = []
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(query: string) {
    this.searchQuery$.next(query);
    if (query.length < 3) {
      this.suggestions = [];
    }
  }

  selectSuggestion(s: { description: string; place_id: string }) {
    this.locationService.getLocationDetails(s.place_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result) return;
        const { lat, lon } = result;
        this.searchQuery = s.description;
        this.suggestions = [];
        this.locationSelected.emit({ text: s.description, lat, lng: lon });
      });
  }
}
