import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { TokenService } from '../../services/token.service';
import { Order } from '../../models/order.interface';
import { CartItem } from '../../class/cart-item';

import { ShopValidators } from '../../validators/shop-validators';
import { Purchase } from '../../class/purchase';
import { Country } from '../../models/country.interface';

import { environment } from '../../../enviroments/environment';
import { CheckoutService } from '../../services/checkout.service';

import { ToastrService } from 'ngx-toastr';
import { Response } from '../../response/response';
import { LocationService } from '../../services/location.service';
import { SharedDataService } from '../../services/shared-data.service';


@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrl: './check-out.component.scss'
})
export class CheckOutComponent implements OnInit {

  purchase!: Purchase ;
  totalProduct: number = 0;
  totalAmount: number = 0.00;
  cartItems: CartItem[] = [];
  orderForm!: FormGroup

  states: any[] = [];
  cities: any[] = [];

  isApplyCoupon = false;
  couponList :string[] = []
  localstorage: Storage = localStorage
  provinces: any[] = [];
  districts: any[] = [];
  billingAddressStates: any = [];
  shippingAddressStates: any = [];
  constructor(
    private orderService: OrderService,
    private formbuilder: FormBuilder,
    private userService: UserService,
    private cartService: CartService,
    private tokenService: TokenService,
    private locationService:LocationService,
    private cdr: ChangeDetectorRef,
    private checkoutService : CheckoutService,
    private toastr: ToastrService,
    private sharedDataService: SharedDataService
  ) {

  }
  ngOnInit(): void {
    this.locationService.getLocations().subscribe((data) => {
      this.provinces = data; // Gán dữ liệu tỉnh/thành
    });
    
    // Lấy giá trị từ sessionStorage
    this.couponList = this.sharedDataService.getCouponList();
    let userDetail = this.userService.getUserDetailFromLocalStorage();
    this.orderForm = this.formbuilder.group({
      customer: this.formbuilder.group({
        fullname: new FormControl(userDetail.fullname, [Validators.required]),
        email: new FormControl(userDetail.email, [Validators.email]),
        phone_number: new FormControl(userDetail.phone_number, [Validators.required, Validators.pattern('[0-9]{10}'), ShopValidators.notOnlyWhitespace]),
      }),
      shipping_address: this.formbuilder.group({
        street: new FormControl(userDetail.address, [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),

      }),
      // billing_address: this.formbuilder.group({
      //   street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
      //   city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
      //   state: new FormControl('', [Validators.required]),

      // }),
      note: [''],
      shipping_method: ['express'],
      payment_method: ['cod'],
      
    })

    //Lấy đơn hàng đã thêm vào giỏ hàng
    this.cdr.detectChanges();
    this.listCartDetails()
  }
  getCities(): void {
    // Lấy giá trị tỉnh/thành phố được chọn
    const stateName = this.orderForm.get('shipping_address')?.value.state;

    // Tìm tỉnh/thành phố trong danh sách
    const selectedProvince = this.provinces.find((province) => province.name === stateName);
    console.log(selectedProvince);
    
    // Lấy danh sách quận/huyện
    if (selectedProvince) {
      this.districts = selectedProvince.districts;
      const firstCity = this.districts[0]?.name || '';
      this.orderForm.get('shipping_address.city')?.setValue(firstCity); // Gán giá trị mặc định cho thành phố
    }
  }
 
  placeOrder() {
    const termsCheckbox = document.getElementById('termsCheckbox') as HTMLInputElement;
    if (this.orderForm.valid && termsCheckbox.checked) {
      this.prepareOrder();
      this.handlePaymentAndOrder(); 
    } else {
      this.toastr.error("Xin vui lòng điền đẩy đủ thông tin","Thiếu thông tin",{
        timeOut:2000
      })
    }
  }
  
  prepareOrder() {
    this.purchase = {
      ...this.purchase,
      ...this.orderForm.value,  // Merge dữ liệu từ orderForm vào purchase
      customer: {
        user_id: this.tokenService.getUserId(),
        fullname: this.orderForm.get('customer.fullname')!.value,  // Lấy giá trị fullname từ orderForm
        email: this.orderForm.get('customer.email')!.value,  // Lấy giá trị email từ orderForm
        phone_number: this.orderForm.get('customer.phone_number')!.value  // Lấy giá trị phone_number từ orderForm
      },
      cart_items: this.cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),  // Thông tin giỏ hàng
      totalAmount: this.totalAmount,  // Tổng tiền
      reason: this.tokenService.getUserId() + "-thanh_toan_hoa_don"  // Lý do thanh toán
    };
  }
  
  
  handlePaymentAndOrder() {
    this.checkoutService.submitOrder(this.purchase).subscribe({
      next: (paymentUrl:string) => {
        paymentUrl = paymentUrl.replace(" ","");
        window.location.href = paymentUrl
      }, 
      error: e => {
        
        this.toastr.error("Sản phẩm không đủ tồn kho, vui lòng kiểm tra lại đơn hàng.","LỖI",{
          timeOut: 2000
        })
      }
        
    });
  }
  
 
  

  
  get fullname() { return this.orderForm.get('customer.fullname'); }
  get email() { return this.orderForm.get('customer.email'); }
  get phone_number() { return this.orderForm.get('customer.phone_number'); }


  get shippingAddressStreet() { return this.orderForm.get('shipping_address.street'); }
  get shippingAddressCity() { return this.orderForm.get('shipping_address.city'); }
  get shippingAddressState() { return this.orderForm.get('shipping_address.state'); }


  // get billingAddressStreet() { return this.orderForm.get('billing_address.street'); }
  // get billingAddressCity() { return this.orderForm.get('billing_address.city'); }
  // get billingAddressState() { return this.orderForm.get('billing_address.state'); }

  // copyShippingAddressToBillingAddress(event: any) {
  //   if (event.target.checked) {
  //     this.orderForm.controls['billing_address']
  //       .setValue(this.orderForm.controls['shipping_address'].value)
  //     //bug fix for states
  //     this.billingAddressStates = this.shippingAddressStates
  //   }
  //   else {
  //     this.orderForm.controls['billing_address'].reset();

  //     //bug fix for states
  //     this.billingAddressStates = [];
  //   }
  // }
  listCartDetails() {
    // get a handle to the cart items
    if (sessionStorage.getItem(`${environment.cartItems}:${this.tokenService.getUserId()}`) != null) {
      let cart = JSON.parse(sessionStorage.getItem(`${environment.cartItems}:${this.tokenService.getUserId()}`)!);
      this.cartItems = cart;
      this.cartItems = this.cartService.cartItems.map(item => ({
        ...item,
        thumbnail: `${environment.apiBaseUrl}/products/images/${item.thumbnail}`
      }));
    }
    else {

      this.cartService.getCartItems().subscribe(
        data => {
          this.cartItems = data
          this.cartItems = this.cartService.cartItems.map(item => ({
            ...item,
            thumbnail: `${environment.apiBaseUrl}/products/images/${item.thumbnail}`
          }));
        }
      );
    }


    /// subscribe to the cart totalPrice
    let discountAmout = this.cartService.getTotalPriceAfterDiscount();
    if (discountAmout > 0) {
      this.totalAmount = discountAmout
    }
    else {
      this.cartService.totalPrice.subscribe(
        data => {
          this.totalAmount = data
        }
      );

    }

    // subscribe to the cart totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => this.totalProduct = data
    )


  }
}
