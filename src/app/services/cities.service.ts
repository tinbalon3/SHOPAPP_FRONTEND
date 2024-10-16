import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class CitiesService {
  private apiCities = "/api/api-tinhthanh/2";

  
  constructor( private http: HttpClient) { }
  
  getCities(id:number):Observable<any> {
    return this.http.get(`${this.apiCities}/${id}.htm`);
  }
}
