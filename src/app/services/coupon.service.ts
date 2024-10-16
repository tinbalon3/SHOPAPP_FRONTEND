import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CouponResponse } from '../response/coupon/coupon.response';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiCoupon = environment.apiBaseUrl + '/coupons/calculate'
  constructor(private http: HttpClient) { }

  applyCoupon(couponCode:string,totalAmount:number):Observable<CouponResponse>{
    let params = new HttpParams()
    .set('couponCode', couponCode.toString())
    .set('totalAmount', totalAmount.toString())
   
    return this.http.get<CouponResponse>(this.apiCoupon,{params})
  }
}
