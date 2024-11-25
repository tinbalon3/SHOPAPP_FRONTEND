import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import {  } from '../dtos/order_details.dto';
import { Purchase } from '../class/purchase';
import { environment } from '../../enviroments/environment';
import { Response } from '../response/response';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiOrder = environment.apiBaseUrl +'/orders'

  constructor(private http: HttpClient) { }

  getOrderById(orderId:string):Observable<Response>{
    return this.http.get<Response>(`${this.apiOrder}/${orderId}`);
  }
  
  placeOrder(purchase:Purchase):Observable<Response> {
    return this.http.post<Response>(`${this.apiOrder}`,purchase);
  }
  getAllOrders(page:number,limit:number): Observable<Response>{
    let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());
    return this.http.get<Response>(`${this.apiOrder}/get-orders`,{params});
  }
  updateOrder(id:number,orderUpdate:any): Observable<Response> {
    return this.http.put<Response>(`${this.apiOrder}/${id}`,orderUpdate);
  }
  deleteOrder(id:number):Observable<Response> {
    return this.http.delete<Response>(`${this.apiOrder}/${id}`);
  }
  getOrderHistory(id:number,status:string,page:number,limit:number):Observable <Response> {
    let params = new HttpParams()
    .set('status',status.toString())
    .set('page', page.toString())
    .set('limit', limit.toString());
    return this.http.get<Response>(`${this.apiOrder}/order-history/${id}`,{params});
  }
}
