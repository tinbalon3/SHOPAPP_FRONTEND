import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, Observer } from 'rxjs';
import { environment } from '../../enviroments/environment';
import { Response } from '../response/response';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private  apiProducts = environment.apiBaseUrl + '/products';
  private  apiProductsPrice = environment.apiBaseUrl + '/products/getPrice';
  constructor(private http: HttpClient) { }

  getProducts(keyword:string,category_id:number,minPrice:number,maxPrice:number,rateStar:number,page:number,limit:number): Observable<Response>{
    let params = new HttpParams()
    .set('keyword', keyword.toString())
    .set('category_id', category_id.toString())
    .set('minPrice', minPrice.toString())
    .set('maxPrice', maxPrice.toString())
    .set('rateStar', rateStar.toString())
    .set('page', page.toString())
    .set('limit', limit.toString());
    return this.http.get<Response>(this.apiProducts, {params})
  }
  addProduct(formData:any):Observable<Response> {
    return this.http.post<Response>(`${this.apiProducts}`,formData
    )
  }
  getProductDetail(productId:number): Observable<Response> {
    return this.http.get<Response>(`${this.apiProducts}/${productId}`);
  }
  getPriceMaxAndMin() :Observable<Response> {
    return this.http.get<Response>(this.apiProductsPrice)
  }
  updateImages(formData:FormData,productId:number): Observable <any>{
    
    return this.http.put(`${this.apiProducts}/images/upload/${productId}`,formData);
  }
  updateProduct(product:any,id:number):Observable<Response>{
    return this.http.put<Response>(`${this.apiProducts}/update/${id}`,product);
  }
  deleteProduct(id:number):Observable<Response> {
    return this.http.delete<Response>(`${this.apiProducts}/${id}`);
  }
}
