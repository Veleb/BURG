import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

interface NominatimResult {
  lat: string;
  lon: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface DistanceResponse {
  distanceKm: number;
}

@Injectable({ providedIn: 'root' })

export class LocationService {
  
  constructor(private http: HttpClient) {}

  geocodeLocation(location: string): Observable<{ lat: number; lon: number } | null> {

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    
    return this.http.get<NominatimResult[]>(url).pipe(
      map(results => {
        if (results.length === 0) return null;
        return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
      })
    );

  }

  getDrivingDistance(coords: [Coordinates, Coordinates]): Observable<DistanceResponse> {
    return this.http.post<DistanceResponse>('/api/ors/distance', { coordinates: coords });
  }
  
}
