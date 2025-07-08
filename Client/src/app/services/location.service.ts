import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

interface Coordinates {
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })

export class LocationService {
  
  constructor(private http: HttpClient) {}

  autocompleteLocation(input: string): Observable<{ description: string; place_id: string }[]> {
    if (input.length < 3) return new Observable(subscriber => subscriber.next([]));

    const url = `/api/locations/autocomplete`;
    return this.http.post<{ predictions: { description: string; place_id: string }[] }>(url, { input }).pipe(
      map(response => response.predictions || [])
    );
  }


  getLocationDetails(placeId: string): Observable<{ lat: number; lon: number } | null> {
    const url = `/api/locations/details`;
    return this.http.post<{ result: { geometry: { location: { lat: number; lng: number } } } }>(url, { place_id: placeId }).pipe(
      map(response => {
        if (!response.result) return null;
        const loc = response.result.geometry.location;
        return { lat: loc.lat, lon: loc.lng };
      })
    );
  }

  getDistanceBetweenPoints(coords: [Coordinates, Coordinates]): Observable<number> {
    return this.http.post<{ distanceKm: number }>('/api/locations/distance', { coordinates: coords }).pipe(
      map(response => response.distanceKm)
    );
  }
  
}
