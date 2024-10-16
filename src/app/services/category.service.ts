import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.interface';
import { environment } from '../../enviroments/environment';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private  apiCategory = environment.apiBaseUrl + '/categories';
  
  constructor(private http: HttpClient) { }
  
  getCategory():Observable<Category[]>{
    return this.http.get<Category[]>(this.apiCategory); 
  }
  deleteCategory(id:number):Observable<any> {
    return this.http.delete(`${this.apiCategory}/${id}`);
  }
  createCategory(name:any):Observable<any>{
    return this.http.post(`${this.apiCategory}`,name);
  }
}
