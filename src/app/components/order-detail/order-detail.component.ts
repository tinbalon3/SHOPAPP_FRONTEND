import { Component, OnInit } from '@angular/core';

import { OrderService } from '../../services/order.service';
import { OrderDetail } from '../../models/order_detail.interface';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../enviroments/environment';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
 //khong làm tròn giá 
  order_details:any
  totalAmount:number =0;
  orderResponse = {
    id:0,
    email:'',
    address:'',
    note:'',
    user_id:'',
    phone_number:'',
    shipping_method:'',
    shipping_address:'',
    status:'',
    fullname:'',
    shipping_date:new Date(),
    payment_method:'',
    order_details: []
  }
  constructor(private orderService: OrderService,
              private route: ActivatedRoute
  ) { }
  ngOnInit(): void {
    this.getOrderDetail()
  }

  getOrderDetail(){
    // debugger
    const orderId= this.route.snapshot.paramMap.get('id');
    this.orderService.getOrderById(orderId!).subscribe({
      next:(response:any)=>{
        // debugger
        
        this.totalAmount = response.total_money
        this.orderResponse.fullname = response.fullname
        this.orderResponse.id = response.id;
        this.orderResponse.address = response.address;
        this.orderResponse.email = response.email
        this.orderResponse.user_id = response.user_id;
        this.orderResponse.note = response.note;
        this.orderResponse.phone_number = response.phone_number;
        this.orderResponse.payment_method = response.payment_method;
        this.orderResponse.status = response.status
        this.orderResponse.shipping_date = new Date(response.shipping_date)
        this.orderResponse.shipping_address =response.shipping_address;
        this.orderResponse.shipping_method = response.shipping_method;
        
        // debugger
        this.orderResponse.order_details = response.order_details.map((orderDetail:OrderDetail)=>{
          orderDetail.product.thumbnail =  `${environment.apiBaseUrl}/products/images/${ orderDetail.product.thumbnail}`;
          
          return orderDetail;
        }
      )
      this.order_details =JSON.parse(JSON.stringify(this.orderResponse.order_details));
    

      },
      complete:()=>{

      },
      error:(e)=>{
        console.log(e.message)
      }
    })
  }
  applyCoupon() {
    throw new Error('Method not implemented.');
  }
}
