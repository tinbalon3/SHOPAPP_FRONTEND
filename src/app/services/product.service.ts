import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, Observer } from 'rxjs';
import { ProductResponse } from '../response/product/product.response';
import { environment } from '../../enviroments/environment';
import { CartItem } from '../class/cart-item';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private  apiProducts = environment.apiBaseUrl + '/products';
  
  constructor(private http: HttpClient) { }

  getProducts(keyword:string,category_id:number,page:number,limit:number): Observable<ProductResponse>{
    let params = new HttpParams()
    .set('keyword', keyword.toString())
    .set('category_id', category_id.toString())
    .set('page', page.toString())
    .set('limit', limit.toString());
    return this.http.get<ProductResponse>(this.apiProducts, {params})
  }
  getProductDetail(productId:number): Observable<any> {
    return this.http.get<any>(`${this.apiProducts}/${productId}`);
  }
  updateImages(formData:FormData,productId:number): Observable <any>{
    
    return this.http.put(`${this.apiProducts}/upload/${productId}`,formData);
  }
  updateProduct(product:any,id:number):Observable<any>{
    return this.http.put(`${this.apiProducts}/update/${id}`,product);
  }
  deleteProduct(id:number):Observable<any> {
    return this.http.delete(`${this.apiProducts}/${id}`);
  }
}
