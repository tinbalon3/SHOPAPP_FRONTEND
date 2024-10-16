import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class StatesService {
  private apiStates = "/api/api-tinhthanh/1/0.htm";

  
  constructor( private http: HttpClient) { }
  
  getStates():Observable<any> {
    return this.http.get(this.apiStates);
  }
}
