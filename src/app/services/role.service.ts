import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../enviroments/environment';
import { Response } from '../response/response';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private  apiRoles = environment.apiBaseUrl + '/roles';
  private apiConfig = {
    headers: this.createHeaders()
  }
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type':'application/json',
      'Accept-Language':'vi'
     
    })
  }
  constructor(private http: HttpClient) { }

  getRoles():Observable<Response>{

    return this.http.get<Response>(this.apiRoles,this.apiConfig);
  }
}


