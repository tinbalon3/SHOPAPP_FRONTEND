import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { TokenService } from '../../services/token.service';
import { environment } from '../../../enviroments/environment';
import { NavigationStart, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrl: './cart-status.component.scss'
})
export class CartStatusComponent implements OnInit{

  totalPrice:number = 0.00;
  totalQuantity:number = 0;
  storage : Storage  = sessionStorage;


  constructor(private cartService: CartService,private router: Router,private userService:UserService){}
  ngOnInit(): void {
    if(this.userService.checkLogin()) {
      this.cartService.loadCart()
      this.updateCartStatus();
    }
   
   
  }
  updateCartStatus(){
 
  
      this.cartService.totalPrice.subscribe(
        data => 
          {
            this.totalPrice = data
           
          }
      )
      this.cartService.totalQuantity.subscribe(
        data => 
          {
            this.totalQuantity = data
           
          }
      )

      


  }
  
}
