import { Component, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef, EventEmitter, Output, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DivIcon, Map, Marker } from 'leaflet';
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
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  @Output() locationSelected = new EventEmitter<string>();

  @Input('layoutType') layoutType: string = 'default';

  selectedLocation: { lat: number; lng: number } | null = null;
  searchQuery: string = '';
  suggestions: NominatimResponse[] = [];
  private map: Map | undefined;
  private leaflet!: typeof import('leaflet');
  private marker: Marker | null = null;
  isInputFocused: boolean = false;

  private blurTimeout: any;

  private searchSub?: Subscription;
  private reverseGeocodeSub?: Subscription;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  closeMap(): void {
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }

    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    
    this.isInputFocused = false;
    this.suggestions = [];
  }

  onBlur(): void {
    this.blurTimeout = setTimeout(() => { // we create a timeout that we can cancel later 
      this.isInputFocused = false;
      this.suggestions = [];
      if (this.map) {
        this.map.remove();
        this.map = undefined;
      }
    }, 4500);
  }

  onFocus(): void { // when the user focuses on the input the map is loaded
    this.isInputFocused = true;
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
    }
  }

  cancelBlurTimeout(): void { // method to clear the timeout so the user can use the map
    if (this.blurTimeout) {
      clearTimeout(this.blurTimeout);
    }
  }

  ngOnDestroy(): void { // we unsubscribe to all of the observables and remove the map
    this.searchSub?.unsubscribe();
    this.reverseGeocodeSub?.unsubscribe();
    if (this.map) {
      this.map.remove();
    }
  }

  loadLeaflet(): void {
    import('leaflet').then((leaflet) => {
      this.leaflet = leaflet;
      if (!this.map && document.getElementById('map')) {
        this.map = leaflet.map('map').setView([51.505, -0.09], 13);
  
        leaflet.tileLayer('https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.{ext}', {
          minZoom: 0,
          maxZoom: 20,
          attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          ext: 'png'
        } as any).addTo(this.map);
  
        this.map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
          this.selectedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
          this.addMarker(e.latlng.lat, e.latlng.lng);
        });
  
        if (this.searchQuery) {
          this.getCoordinatesFromQuery(this.searchQuery);
        }
      } else if (this.map && this.searchQuery) {
        this.getCoordinatesFromQuery(this.searchQuery);
      }
    }).catch(console.error);
  }
  
  onSearch(query: string): void {
    this.searchQuery = query;
    if (query.length > 2) {
      this.searchSub = this.http
        .get<NominatimResponse[]>(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`)
        .pipe(
          catchError(() => of([]))
        )
        .subscribe((data) => {
          this.suggestions = data;
        });
    } else {
      this.suggestions = [];
    }
  }

  selectLocation(lat: number, lon: number, displayName: string): void {
    this.selectedLocation = { lat, lng: lon };
    this.suggestions = [];
    this.searchQuery = displayName;

    this.locationSelected.emit(displayName);
    this.map?.setView([lat, lon], 13);
    this.addMarker(lat, lon, displayName);
  }

  private addMarker(lat: number, lon: number, displayName?: string): void {
    if (this.marker) {
      this.marker.remove();
    }

    const mapPinIcon: DivIcon = this.leaflet.divIcon({
      html: `<i class="fas fa-map-marker-alt" style="font-size: 24px; color: red;"></i>`,
      iconSize: [25, 40],
      iconAnchor: [12, 40],
      popupAnchor: [0, -40],
      className: 'map-pin-icon',
    });

    if (this.map) {
      this.marker = this.leaflet.marker([lat, lon], { icon: mapPinIcon }).addTo(this.map);
    }

    if (displayName) {
      this.searchQuery = displayName;
    } else {
      this.reverseGeocodeSub = this.http
        .get<any>(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        .pipe(
          catchError(() => of(null))
        )
        .subscribe((data) => {
          const popupContent = data?.display_name || `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          this.searchQuery = popupContent;
        });
    }
  }

  private getCoordinatesFromQuery(query: string): void {
    this.http.get<NominatimResponse[]>(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=1`
    ).pipe(
      catchError(() => of([]))
    ).subscribe((data) => {
      if (data && data.length) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        this.selectedLocation = { lat, lng: lon };
  
        if (this.map) {
          this.map.setView([lat, lon], 13);
          this.addMarker(lat, lon, result.display_name);
        }
      }
    });
  }
  
}