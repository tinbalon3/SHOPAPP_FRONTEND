import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  private isApplyCoupon: boolean = false;
  private couponList: string[] = [];

  // Getter và Setter cho isApplyCoupon
  

  // Getter và Setter cho couponList
  setCouponList(coupons: string[]): void {
    this.couponList = coupons;
  }

  getCouponList(): string[] {
    return this.couponList;
  }
}
