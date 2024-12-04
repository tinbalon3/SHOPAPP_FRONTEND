import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout-successfull',
  templateUrl: './checkout-status.component.html',
  styleUrl: './checkout-status.component.scss'
})
export class CheckoutStatusComponent implements OnInit{
  transactionData: any = {};
  status: string = '';
  constructor(
    private cartService: CartService,
    private route: ActivatedRoute
    
  ) {}

  ngOnInit(): void {
    // Lấy các tham số từ URL
    const statusOrder = this.route.snapshot.queryParamMap.get("status")?.toString();
    if(statusOrder != null)
      this.status = statusOrder;
      if(statusOrder == 'success')
        this.cartService.clearCartItems();
  }
}
