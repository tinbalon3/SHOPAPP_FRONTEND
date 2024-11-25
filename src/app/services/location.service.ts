import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private jsonUrl = 'assets/locations/location-vn-api.json';
  constructor(private http: HttpClient) { }
  getLocations(): Observable<any> {
    return this.http.get(this.jsonUrl);
  }
}
