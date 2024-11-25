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
  status:boolean = false;
  constructor(
    private cartService: CartService,
    private route: ActivatedRoute
    
  ) {}

  ngOnInit(): void {
    // Lấy các tham số từ URL
    const statusOrder = Boolean(this.route.snapshot.queryParamMap.get("status"));
    this.status = statusOrder;
    this.cartService.clearCartItems();
  }
}
