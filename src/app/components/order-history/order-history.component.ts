import { Component, OnInit } from '@angular/core';

import { OrderDetail } from '../../models/order_detail.interface';
import { OrderService } from '../../services/order.service';
import { ActivatedRoute } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { environment } from '../../../enviroments/environment';
import { Response } from '../../response/response';
import { OrderHistoryDTO } from '../../dtos/order_details.dto';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent implements OnInit {
reviewProduct(arg0: number) {
throw new Error('Method not implemented.');
}

  currentPage = 1;
  itemsPerPage: number = 10;
  totalElements:number = 0 ;
  order_details: any
  totalAmount: number = 0;
  orderHistory:OrderHistoryDTO [] = [];
  
  isActive: number = 0;
  statusOrder = ""
  tabs = [
    {
      key: "",
      content: "Tất cả"
    },
    {
      key: "pending",
      content: "Chưa xử lý"
    },
    {
      key: "processing",
      content: "Đang xử lý"
    },
    {
      key: "reserved",
      content: "Đặt trước"
    },
    {
      key: "shipped",
      content: "Đã vận chuyển"
    },
    {
      key: "delivered",
      content: "Đã giao hàng"
    },
    {
      key: "canceled",
      content: "Đã hủy"
    }
  ];

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private tokenService:TokenService) { }


  ngOnInit(): void {
    this.getOrderHistory(this.statusOrder,this.currentPage,this.itemsPerPage);
  }
  setActive(index:number){
    this.isActive = index;
    this.statusOrder = this.tabs[index].key
    this.getOrderHistory(this.statusOrder,this.currentPage,this.itemsPerPage);
  }
  getOrderHistory(status:string,currentPage:number,itemsPerPage:number) {
    
    const userId = this.tokenService.getUserId();
    this.orderService.getOrderHistory(userId!,status,currentPage-1,itemsPerPage).subscribe({
      next: (response: Response) => {
        
        if(response.data == null){
          this.orderHistory = [];
        
          return;
        }
        this.orderHistory = response.data.orderDetails;
        this.totalElements = response.data.totalElements;
      },
     
      error: (e) => {
        console.log(e.error.message)
      }
    })
  }
   timeAgo(orderTimestamp: string): string {
   
    const now = new Date();
    const orderDate = new Date(orderTimestamp);
    const diffInSeconds = Math.floor((now.getTime() - orderDate.getTime()) / 1000);
  
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30); // Rough estimate
    const years = Math.floor(days / 365); // Rough estimate
  
    if (years > 0) {
      return `${years} năm${years > 1 ? 's' : ''} trước`;
    } else if (months > 0) {
      return `${months} tháng${months > 1 ? 's' : ''} trước`;
    } else if (weeks > 0) {
      return `${weeks} tuần${weeks > 1 ? 's' : ''} trước`;
    } else if (days > 0) {
      return `${days} ngày${days > 1 ? 's' : ''} trước`;
    } else if (hours > 0) {
      return `${hours} giờ${hours > 1 ? 's' : ''} trước`;
    } else if (minutes > 0) {
      return `${minutes} phút${minutes > 1 ? 's' : ''} trước`;
    } else {
      return 'Mới đây';
    }
  }
  
  updatePageSize(pageSize: string) {
    this.itemsPerPage = +pageSize;
    this.currentPage = 1;
    this.getOrderHistory(this.statusOrder,this.currentPage,this.itemsPerPage);
  }
  
}
