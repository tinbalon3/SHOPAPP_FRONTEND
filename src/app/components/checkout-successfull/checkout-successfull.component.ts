import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout-successfull',
  templateUrl: './checkout-successfull.component.html',
  styleUrl: './checkout-successfull.component.scss'
})
export class CheckoutSuccessfullComponent implements OnInit{
  transactionData: any = {};

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // Lấy các tham số từ URL
    this.cartService.clearCartItems();
  }
}
