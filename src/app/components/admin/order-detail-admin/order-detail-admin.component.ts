import { Component, OnInit } from '@angular/core';
import { Order } from '../../../models/order.interface';
import { UserService } from '../../../services/user.service';
import { TokenService } from '../../../services/token.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';

import { OrderDetail } from '../../../models/order_detail.interface';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../enviroments/environment';
import { OrderDetailAdminDTO } from '../../../models/order_detail_admin.interface';

@Component({
  selector: 'app-order-detail-admin',
  templateUrl: './order-detail-admin.component.html',
  styleUrl: './order-detail-admin.component.scss'
})
export class OrderDetailAdminComponent implements OnInit{

  orderDetails:any;
  totalAmount:number =0;
  orderDetailRequest!: OrderDetailAdminDTO;
  shipping_address = ''
 
  constructor(
    private router:ActivatedRoute,
    private orderService:OrderService,
    private toastr: ToastrService
  ){}

ngOnInit(): void {
  this.getOrderDetail();
}
getOrderDetail(){
 
  const orderID = this.router.snapshot.paramMap.get('id')!;
  this.orderService.getOrderById(orderID).subscribe({
    next:(response:any)=>{
      this.orderDetailRequest = response;
      this.orderDetailRequest!.order_details = response.order_details.map((orderDetail:OrderDetail)=>{
        orderDetail.product.thumbnail =  `${environment.apiBaseUrl}/products/images/${ orderDetail.product.thumbnail}`;
        return orderDetail;
      }
    )
    this.shipping_address = `${this.orderDetailRequest.shipping_address.city} ${this.orderDetailRequest.shipping_address.state} ${this.orderDetailRequest.shipping_address.city}`
    this.orderDetailRequest =JSON.parse(JSON.stringify(this.orderDetailRequest));
  

    },
    complete:()=>{

    },
    error:(e)=>{
      console.log(e.message)
    }
  })
}
  updateOrder(id:number){
   
    this.orderService.updateOrder(id,{status:this.orderDetailRequest!.status}).subscribe({
      next:(response:any)=>{
    
        this.toastr.success(response.message, 'Update', {
          timeOut: 3000,
        })
        // .onHidden.subscribe(() => {
        //   this.routerNavigate.navigate(['/admin/orders']);
        // });
      },
      complete:()=>{
        
      },
      error:(e)=>{
        console.log(e.message)
      }
    })
  }
}
