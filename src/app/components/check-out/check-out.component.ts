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
import { CitiesService } from '../../services/cities.service';
import { StatesService } from '../../services/states.service';
import { environment } from '../../../enviroments/environment';
import { CheckoutService } from '../../services/checkout.service';
import { CheckoutDTO } from '../../dtos/checkout.dto';
import { HttpResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Response } from '../../response/response';


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
  sessionStorage: Storage = sessionStorage

  billingAddressStates: any = [];
  shippingAddressStates: any = [];
  constructor(private orderService: OrderService,
    private formbuilder: FormBuilder,
    private userService: UserService,
    private citiesService: CitiesService,
    private cartService: CartService,
    private tokenService: TokenService,
    private statesService: StatesService,
    
    private cdr: ChangeDetectorRef,
    private router: Router,
    private checkoutService : CheckoutService,
    private toastr: ToastrService
  ) {

  }
  ngOnInit(): void {
    
    
    // Lấy giá trị từ sessionStorage
    const couponValue = this.sessionStorage.getItem("isApplyCoupon");

    // Kiểm tra và chuyển đổi giá trị
    let isApplyCoupon: boolean = false; // Giá trị mặc định
    if (couponValue) {
      isApplyCoupon = JSON.parse(couponValue);
      this.isApplyCoupon = isApplyCoupon
    }


    this.orderForm = this.formbuilder.group({
      customer: this.formbuilder.group({
        fullname: new FormControl(this.userService.getUserDetailFromSessionStorage().fullname, [Validators.required]),
        email: new FormControl('tinbalon3@gmail.com', [Validators.email]),
        phone_number: new FormControl(this.userService.getUserDetailFromSessionStorage().phone_number, [Validators.required, Validators.pattern('[0-9]{10}'), ShopValidators.notOnlyWhitespace]),
      }),
      shipping_address: this.formbuilder.group({
        street: new FormControl('108D/30 Trương Định', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        city: new FormControl('Châu Đốc', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        state: new FormControl('An Giang', [Validators.required]),

      }),
      billing_address: this.formbuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),

      }),
      note: [''],
      shipping_method: ['express'],
      payment_method: ['cod'],
      
    })

    

    //Lấy đơn hàng đã thêm vào giỏ hàng
    this.cdr.detectChanges();
    this.listCartDetails()

    this.statesService.getStates().subscribe(
      data => {
        this.states = data.data;
        this.getCities('shipping_address');
      })
    

  }

  getCities(formGroupName: string) {
    let stateName = this.orderForm.get(formGroupName)?.value.state;
    let state = this.states.find(state => state.name === stateName)

    this.citiesService.getCities(state.id).subscribe(
      data => {
        if (formGroupName === 'shipping_address') {
          this.shippingAddressStates = data.data
          let city = this.shippingAddressStates[0].name;
          this.orderForm.get("shipping_address.city")?.setValue(city)
        }
        else {
          this.billingAddressStates = data.data
          let city = this.billingAddressStates[0].name;
          this.orderForm.get("billing_address.city")?.setValue(city)
        }
      })
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
    console.log(this.purchase);
    
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
  
 
  
  // finalizeOrder() {
  //   this.orderService.placeOrder(this.purchase).subscribe({
  //     next: (response:Response) => {
       
  //       this.router.navigate(['/checkout-successfull/', response.data.orderTrackingNumber]);
  //     },
  //     error: e => console.error("Đặt hàng thất bại: ", e)
  //   });
  // }
  
  get fullname() { return this.orderForm.get('customer.fullname'); }
  get email() { return this.orderForm.get('customer.email'); }
  get phone_number() { return this.orderForm.get('customer.phone_number'); }


  get shippingAddressStreet() { return this.orderForm.get('shipping_address.street'); }
  get shippingAddressCity() { return this.orderForm.get('shipping_address.city'); }
  get shippingAddressState() { return this.orderForm.get('shipping_address.state'); }


  get billingAddressStreet() { return this.orderForm.get('billing_address.street'); }
  get billingAddressCity() { return this.orderForm.get('billing_address.city'); }
  get billingAddressState() { return this.orderForm.get('billing_address.state'); }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.orderForm.controls['billing_address']
        .setValue(this.orderForm.controls['shipping_address'].value)
      //bug fix for states
      this.billingAddressStates = this.shippingAddressStates
    }
    else {
      this.orderForm.controls['billing_address'].reset();

      //bug fix for states
      this.billingAddressStates = [];
    }
  }
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
