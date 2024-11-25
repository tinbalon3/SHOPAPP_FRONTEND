import { Injectable, OnInit } from '@angular/core';
import { CartItem } from '../class/cart-item';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { TokenService } from './token.service';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { environment } from '../../enviroments/environment';

import { Router } from '@angular/router';
import { Response } from '../response/response';

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnInit {

  cartItems: CartItem[] = [];
  isRemove = false;
  totalPrice = new BehaviorSubject<number>(0);
  totalPriceAfterApplyCoupon = 0;
  totalQuantity = new BehaviorSubject<number>(0);
  cartUpdatedSubject = new BehaviorSubject<any>(null); 
  userId: number = 0;
  cartLocal: any;

  storage: Storage = localStorage;
  sessionStorage: Storage = sessionStorage

  private apiCart = environment.apiBaseUrl + '/cart';

  constructor(private http: HttpClient, private tokenService: TokenService, private router: Router) {
    this.cartItems = [];
    this.cartUpdatedSubject.pipe(
      debounceTime(1000),  
      switchMap(() => this.persistCartItems())  // Gọi API lưu giỏ hàng
    ).subscribe();
  }
  ngOnInit(): void {

  }

  loadCart() {
    this.userId = this.tokenService.getUserId();
     // Khởi tạo `cartItems` là một mảng rỗng
  
    if (this.userId != 0) {
      this.cartLocal = this.storage.getItem(`${environment.cartItems}:${this.userId}`);
      
      if (this.cartLocal != null) {
        // Parse `cartLocal` nếu có dữ liệu và kiểm tra xem nó là mảng hợp lệ
        const parsedCart = JSON.parse(this.cartLocal);
        if (Array.isArray(parsedCart) && parsedCart.length != 0) {
          this.cartItems = parsedCart;
          this.computeCartTotals();
          
        }
      } else {
        this.getCartItems().subscribe(data => {
          // Kiểm tra `data` để đảm bảo rằng nó là mảng và không rỗng
          if (data && Array.isArray(data)) {
            this.cartItems = data;
           
          } else {
            this.cartItems = []; // Thiết lập giá trị mặc định nếu dữ liệu không hợp lệ
          }
          this.computeCartTotals(); // Tính tổng cart items sau khi đảm bảo `cartItems` đã được khởi tạo
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
    if(this.cartItems != null ) {
      let existingCartItem = this.cartItems.find(item => item.id === theCartItem.id);
      if (existingCartItem) {
        existingCartItem.quantity += quantity;
      } else {
        theCartItem.quantity = quantity;
        this.cartItems.push(theCartItem);
      }
    }
   
    this.computeCartTotals();
    this.saveToLocalStorage(); // Lưu vào LocalStorage thay vì gọi API ngay lập tức
    this.cartUpdatedSubject.next(this.cartItems);

  }
  syncCartWithServer() {
    this.userId = this.tokenService.getUserId();
    if (this.userId != 0) {
      this.persistCartItems().subscribe()
    }
  }
 

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
    this.sessionStorage.setItem("totalAmountAfterApplyCoupon", this.totalPriceAfterApplyCoupon.toString())
  }
  getTotalPriceAfterDiscount() {
    return Number(this.sessionStorage.getItem("totalAmountAfterApplyCoupon"))
  }
  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    if(this.cartItems.length > 0) {
    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.price;
      totalQuantityValue += currentCartItem.quantity;
    }
  }
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(this.cartItems.length);
  }

  decrementQuantity(theCartItem: CartItem) {

    let existingCartItem = this.cartItems.find(item => item.id === theCartItem.id);
    if (existingCartItem) {
      existingCartItem.quantity--;
    } 
    // else {
    //   this.remove(theCartItem);
    // }
   
    this.computeCartTotals();
    this.saveToLocalStorage(); // Lưu vào LocalStorage thay vì gọi API ngay lập tức
    this.cartUpdatedSubject.next(this.cartItems);
  }

  remove(theCartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex(item => item.id === theCartItem.id);
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.userId = this.tokenService.getUserId();
      this.computeCartTotals()
      this.saveToLocalStorage()
      this.removeFromCart(this.userId, theCartItem.id, theCartItem.quantity).subscribe();
    }
  }

  persistCartItems(): Observable<any> {
    if (this.cartItems.length > 0) {
      this.userId = this.tokenService.getUserId();
      if (this.userId) {
        return this.http.post(`${this.apiCart}/add/${this.userId}`, this.cartItems);
      } else {
        console.error("User ID is not available.");
        return of(null);
      }
    }
    // Trả về một Observable rỗng nếu cartItems trống
    return of(null);
  }
  

  getCartItems(): Observable<any> {
    debugger
    this.userId = this.tokenService.getUserId();
  
    // Kiểm tra nếu userId hợp lệ, nếu không trả về mảng rỗng ngay lập tức
    if (!this.userId || this.userId === 0) {
      return of([]); // Trả về mảng rỗng nếu người dùng chưa đăng nhập hoặc userId không hợp lệ
    }
  debugger
    return this.http.get<Response>(`${this.apiCart}/get/${this.userId}`).pipe(
      map((response: Response) => {
        if (response.status === 'OK') {
          console.log(response);
          
          return response.data; // Trả về dữ liệu giỏ hàng nếu trạng thái OK
        } else {
          console.error('Lỗi khi lấy giỏ hàng:', response.message);
          return []; // Trả về mảng rỗng nếu có lỗi
        }
      }),
      catchError((error) => {
        console.error('Lỗi kết nối API:', error);
        return of([]); // Trả về mảng rỗng trong trường hợp có lỗi
      })
    );
  }
  


  removeFromCart(userId: number, productId: number, quantity: number): Observable<any> {
    return this.http.delete(`${this.apiCart}/remove/${userId}/${quantity}`);
  }

  clearCartItems() {
    this.userId = this.tokenService.getUserId();
    this.http.delete(`${this.apiCart}/clear/${this.userId}`).subscribe(() => {
      this.cartItems = [];
      this.computeCartTotals();
      this.saveToLocalStorage(); // Lưu vào LocalStorage
    });
  }

  saveToLocalStorage() {
    if(this.userId) {
      this.storage.setItem(`${environment.cartItems}:${this.userId}`, JSON.stringify(this.cartItems));
    }
    
  }
  removeToLocalStorage() {

    this.storage.removeItem(`${environment.cartItems}:${this.userId}`);
  }
}
