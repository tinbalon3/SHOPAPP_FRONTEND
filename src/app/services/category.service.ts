import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.interface';
import { environment } from '../../enviroments/environment';
import { Response } from '../response/response';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private  apiCategory = environment.apiBaseUrl + '/categories';
  
  constructor(private http: HttpClient) { }
  
  getCategory():Observable<Response>{
    console.log(this.apiCategory);
    
    return this.http.get<Response>(this.apiCategory); 
  }
  deleteCategory(id:number):Observable<Response> {
    return this.http.delete<Response>(`${this.apiCategory}/${id}`);
  }
  createCategory(name:any):Observable<Response>{
    return this.http.post<Response>(`${this.apiCategory}`,name);
  }
}
