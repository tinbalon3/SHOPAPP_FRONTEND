import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { OrderDetail } from '../models/order_detail.interface';
import { Order } from '../models/order.interface';
import { OrdersResponse } from '../response/order/orders.response';
import { OrderDetailsHistoryDTo } from '../dtos/order_details.dto';
import { Purchase } from '../class/purchase';
import { environment } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiOrder = environment.apiBaseUrl +'/orders'

  constructor(private http: HttpClient) { }

  getOrderById(orderId:string):Observable<any>{
    return this.http.get(`${this.apiOrder}/${orderId}`);
  }
  
  placeOrder(purchase:Purchase):Observable<any> {
    return this.http.post(`${this.apiOrder}`,purchase);
  }
  getAllOrders(page:number,limit:number): Observable<OrdersResponse>{
    let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());
    return this.http.get<OrdersResponse>(`${this.apiOrder}/get-orders`,{params});
  }
  updateOrder(id:number,orderUpdate:any): Observable<any> {
    return this.http.put(`${this.apiOrder}/${id}`,orderUpdate);
  }
  deleteOrder(id:number):Observable<any> {
    return this.http.delete(`${this.apiOrder}/${id}`,{responseType: 'text'});
  }
  getOrderDetailHistory(id:number,status:string,page:number,limit:number):Observable <OrderDetailHistoryResponse> {
    let params = new HttpParams()
    .set('status',status.toString())
    .set('page', page.toString())
    .set('limit', limit.toString());
    return this.http.get<OrderDetailHistoryResponse>(`${this.apiOrder}/order-history/${id}`,{params});
  }
}
export interface OrderDetailHistoryResponse {
  orderDetails: OrderDetailsHistoryDTo[];
  totalElements: number;
}