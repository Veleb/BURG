import {
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
  Input,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NominatimResponse } from '../../../../types/api-responses';
import { catchError, Subscription, of } from 'rxjs';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.css',
})
export class LocationPickerComponent implements OnDestroy {

  private http = inject(HttpClient);

  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  @Output() locationSelected = new EventEmitter<string>();

  @Input('layoutType') layoutType: string = 'default';

  selectedLocation: { lat: number; lng: number } | null = null;
  searchQuery: string = '';
  suggestions: NominatimResponse[] = [];
  isInputFocused: boolean = false;

  private blurTimeout: any;
  private searchSub?: Subscription;
  private reverseGeocodeSub?: Subscription;
  
  onBlur(): void {
    this.blurTimeout = setTimeout(() => {
      this.isInputFocused = false;
      this.suggestions = [];
    }, 4500);
  }

  onFocus(): void {
    this.isInputFocused = true;
  }

  

  cancelBlurTimeout(): void {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.reverseGeocodeSub?.unsubscribe();
  }

  selectSuggestion(suggestion: NominatimResponse): void {
    this.searchQuery = suggestion.display_name;
    this.suggestions = [];
    this.locationSelected.emit(suggestion.display_name);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    if (query.length > 2) {
      this.searchSub = this.http
        .get<NominatimResponse[]>(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`
        )
        .pipe(catchError(() => of([])))
        .subscribe((data) => {
          this.suggestions = data;
        });
    } else {
      this.suggestions = [];
    }
  }

  reset(): void {
    this.searchQuery = '';
    this.suggestions = [];
    this.selectedLocation = null;
  }

}
