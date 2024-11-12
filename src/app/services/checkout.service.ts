import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutDTO } from '../dtos/checkout.dto';
import { Purchase } from '../class/purchase';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private apiVnPayment = environment.apiBaseUrl + '/vnpay/submitOrder'
  constructor(private http: HttpClient) { }
  
  submitOrder(checkoutModel: Purchase):Observable<any> {
    
    return this.http.post(`${this.apiVnPayment}`,checkoutModel,{ responseType: 'text' })
  }
  getPaymentInfo(api:string): Observable<HttpResponse<any>> {
    return this.http.get<HttpResponse<any>>(api,{
       observe: 'response'
    });
  }
}
