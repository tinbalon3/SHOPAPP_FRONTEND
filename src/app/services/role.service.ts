import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { RoleResponse } from '../response/roles/role.response';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../enviroments/environment';

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

  getRoles():Observable<any>{

    return this.http.get<RoleResponse>(this.apiRoles,this.apiConfig);
  }
}


