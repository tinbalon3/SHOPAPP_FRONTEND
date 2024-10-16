import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VerifyUserService {

  private apiUrl = environment.apiBaseUrl + "/users/verify";

  constructor(private http: HttpClient, 
  ) { }
  verify(code:string):Observable<HttpResponse<any>> {
    let params = new HttpParams()
    .set('code', code.toString())
    return this.http.get<HttpResponse<any>>(this.apiUrl, {
      params: params,
      observe: 'response' // Đảm bảo observe là một phần của cùng một đối tượng
    });
  }
}
