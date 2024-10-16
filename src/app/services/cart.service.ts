import { Injectable, OnInit } from '@angular/core';
import { CartItem } from '../class/cart-item';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { TokenService } from './token.service';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../enviroments/environment';

import {  Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnInit{

  cartItems: CartItem[] = [];
  isRemove = false;
  totalPrice = new BehaviorSubject<number>(0);
  totalPriceAfterApplyCoupon =0;
  totalQuantity = new BehaviorSubject<number>(0);

  userId:number = 0;
  cartLocal: any;
  
  storage: Storage = localStorage;
  sessionStorage : Storage = sessionStorage
  
  private apiCart = environment.apiBaseUrl + '/cart';

  constructor(private http: HttpClient, private tokenService: TokenService,private router: Router) {
   
  }
  ngOnInit(): void {
    
  }
 
  loadCart() {
    this.userId = this.tokenService.getUserId()
    if(this.userId != 0) {
      this.cartLocal = this.storage.getItem(`${environment.cartItems}:${this.userId}`);
      if (this.cartLocal != null ) {
        if(this.cartLocal.length != 0) {
          this.cartItems = JSON.parse(this.cartLocal);
          this.computeCartTotals()
         
        }
        
      }
      else {
        this.getCartItems().subscribe(data => {
          // Kiểm tra nếu data là Map và chuyển đổi thành Array nếu cần thiết
          this.cartItems = data;
          this.computeCartTotals();
          this.saveToLocalStorage();
         
        });
      }
    }
    

  }

 

  resetCart() {
    this.cartItems = [];
    this.totalPrice.next(0);
    this.totalQuantity.next(0);
    // Xóa giỏ hàng trong localStorage hoặc sessionStorage nếu cần
    this.removeToLocalStorage()
  }
  addToCart(theCartItem: CartItem, quantity: number = 1) {
    let existingCartItem = this.cartItems.find(item => item.id === theCartItem.id);
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      theCartItem.quantity = quantity;
      this.cartItems.push(theCartItem);
    }
    this.computeCartTotals();
    this.saveToLocalStorage(); // Lưu vào LocalStorage thay vì gọi API ngay lập tức
   

  }
  syncCartWithServer() {
    const userId = this.tokenService.getUserId();
    if (userId != 0) {
     this.persistCartItems().subscribe()
    }
  }
  // syncCartWithServer = this.debounce(() => {
  //   this.persistCartItems().subscribe();
  // }, 3000); // Thời gian debounce là 3 giây

  // Hàm debounce
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  updateTotalPrice(newPrice: number): void {
    this.totalPriceAfterApplyCoupon = newPrice;
    this.sessionStorage.setItem("totalAmountAfterApplyCoupon",this.totalPriceAfterApplyCoupon.toString())
  }
  getTotalPriceAfterDiscount(){
    return Number(this.sessionStorage.getItem("totalAmountAfterApplyCoupon"))
  }
  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    
    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.price;
      totalQuantityValue += currentCartItem.quantity;
    }
    
    this.totalPrice.next(totalPriceValue);
    console.log("chay vao day")
    this.totalQuantity.next(this.cartItems.length);
  }

  decrementQuantity(theCartItem: CartItem) {
   
    let existingCartItem = this.cartItems.find(item => item.id === theCartItem.id);
    if (existingCartItem) {
      existingCartItem.quantity--;
    } else {
      this.remove(theCartItem);
    }
    this.computeCartTotals();
    this.saveToLocalStorage(); // Lưu vào LocalStorage thay vì gọi API ngay lập tức
    // this.syncCartWithServer();
  }

  remove(theCartItem: CartItem) {

    const itemIndex = this.cartItems.findIndex(item => item.id === theCartItem.id);
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      const userId = this.tokenService.getUserId();
      this.computeCartTotals()
      this.saveToLocalStorage()
      console.log(theCartItem.id)
      this.removeFromCart(userId, theCartItem.id, theCartItem.quantity).subscribe();
    }
  }

  persistCartItems(): Observable<any> {
    const userId = this.tokenService.getUserId();
    return this.http.post(`${this.apiCart}/add/${userId}`, this.cartItems);
  }

  getCartItems(): Observable<any> {
    const userId = this.tokenService.getUserId();
   
    // Kiểm tra nếu userId hợp lệ, nếu không trả về mảng rỗng ngay lập tức
    if (!userId || userId === 0) {
      return of([]); // Trả về mảng rỗng nếu người dùng chưa đăng nhập hoặc userId không hợp lệ
    }
    
    return this.http.get(`${this.apiCart}/get/${userId}`).pipe(
      map(data => {
        // Kiểm tra và xử lý dữ liệu trước khi trả về
        if (data && typeof data === 'object') {
          return Array.isArray(data) ? data : Object.values(data);
        } else {
          return data;
        }
      }),
      catchError(error => {
        console.error('Error fetching cart items:', error);
        return of([]); // Trả về mảng rỗng trong trường hợp có lỗi
      })
    );
  }


  removeFromCart(userId: number, productId: number, quantity: number): Observable<any> {
    return this.http.delete(`${this.apiCart}/update/${userId}/${productId}/${quantity}`);
  }

  clearCartItems() {
    const userId = this.tokenService.getUserId();
    this.http.delete(`${this.apiCart}/clear/${userId}`).subscribe(() => {
      this.cartItems = [];
      this.computeCartTotals();
      this.saveToLocalStorage(); // Lưu vào LocalStorage
    });
  }

  saveToLocalStorage() {
    this.storage.setItem(`${environment.cartItems}:${this.userId}`, JSON.stringify(this.cartItems));
  }
  removeToLocalStorage() {
    
    this.storage.removeItem(`${environment.cartItems}:${this.userId}`);
  }
}
