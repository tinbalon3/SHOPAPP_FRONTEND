import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { Order } from '../../../models/order.interface';
import { OrderService } from '../../../services/order.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-admin',
  templateUrl: './order-admin.component.html',
  styleUrl: './order-admin.component.scss'
})
export class OrderAdminComponent implements OnInit{
  
  orders: Order[] = [];
  currentPage = 1;
  itemsPerPage: number = 5;
  pages :number [] = [];
  totalPages:number = 0 ;
  totalElements:number = 0;
  keyword:string ="";
  bsModalRef?: BsModalRef;
  shipping_address = ''
  constructor(
              private router:Router,
              private toastr: ToastrService,
              private modalService: BsModalService,
              private orderService:OrderService){}

  ngOnInit(): void {
    this.getAllOrders(this.currentPage,this.itemsPerPage);
  }
  updatePageSize(pageSize: string) {
    this.itemsPerPage = +pageSize;
    this.currentPage = 1;
    this.getAllOrders(this.currentPage,this.itemsPerPage);
  }
  getAllOrders(currentPage: number, itemsPerPage: number) {
    this.orderService.getAllOrders(currentPage-1,itemsPerPage).subscribe({
      next: (response:any) => {
      
        this.orders = JSON.parse(JSON.stringify(response.orders));
      
        this.orders =  this.orders.map((order:any) => {
        
          order.shipping_address = `${order.shipping_address.city} ${order.shipping_address.state} ${order.shipping_address.street}`;
              return order;
        })
        
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
      } ,
      complete:() => {
      },
      error:(e) => {
        console.error(e.message)
      }
    })
  }
  viewOrder(id:number){
    this.router.navigate(['/admin/orders',id])
  }
  openConfirmDialog(orderId: number) {
    const initialState = {
      title: 'Xác nhận xóa đơn hàng',
      message: 'Bạn có chắc muốn xóa đơn hàng này?',
    };
    this.bsModalRef = this.modalService.show(ConfirmDialogComponent, { initialState });

    this.bsModalRef.content?.confirm.subscribe(() => {
      this.deleteOrder(orderId);
    });

    
  }

  deleteOrder(orderId: number) {
    this.orderService.deleteOrder(orderId).subscribe({
      next: (response) => {
        this.toastr.success(response,"Delete", {
          timeOut: 1000,
        }).onHidden.subscribe(()=>{
        
          location.reload()
        }
        )
       
      },
      error: (error) => {
        console.error('Error deleting order', error);
      }
    });
  }
}
