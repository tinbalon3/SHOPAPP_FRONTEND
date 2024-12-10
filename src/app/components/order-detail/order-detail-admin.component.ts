import { Component, OnInit } from '@angular/core';
import { OrderDetailAdminDTO } from '../../models/order_detail_admin.interface';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ToastrService } from 'ngx-toastr';
import { Response } from '../../response/response';
import { environment } from '../../../enviroments/environment';
import { OrderDetail } from '../../models/order_detail.interface';
import { ProductDetailDTO } from '../../dtos/product_detail.dto';
import { CartItem } from '../../class/cart-item';
import { ProductService } from '../../services/product.service';
import { OrderHistoryDTO } from '../../dtos/order_details.dto';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ReviewProductRatingComponent } from '../review-product-rating/review-product-rating.component';


@Component({
  selector: 'app-order-detail-admin',
  templateUrl: './order-detail-admin.component.html',
  styleUrl: './order-detail-admin.component.scss'
})
export class OrderDetailComponent implements OnInit {

  bsModalRef?: BsModalRef;
  orderDetails: any;
  totalAmount: number = 0;
  orderDetailRequest!: OrderDetailAdminDTO;
  shipping_address = ''
  theCartItem?: CartItem;
  constructor(
    public modalService: BsModalService,
    private router: ActivatedRoute,
    private orderService: OrderService,
    private toastr: ToastrService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.getOrderDetail();
  }

  openReviewModal(item: CartItem): void {

    const initialState = {
      theCartItem: item // Truyền productId vào modal
    };

    this.bsModalRef = this.modalService.show(ReviewProductRatingComponent, {
      initialState,
      class: 'modal-lg' // Tùy chỉnh kích thước modal

    });
  }

  reviewProduct(productId: number) {
    this.productService.getProductDetail(productId).subscribe({
      next: (response: Response) => {
        this.theCartItem = new CartItem(response.data);
        
        
        this.openReviewModal(this.theCartItem)

      },
      error: (e: any) => {
        console.log(e.error.message);

      }
    })
  }
  getOrderDetail() {

    const orderID = this.router.snapshot.paramMap.get('id')!;
    this.orderService.getOrderById(orderID).subscribe({
      next: (response: Response) => {
        this.orderDetailRequest = response.data;
        this.orderDetailRequest!.order_details = response.data.order_details.map((orderDetail: OrderDetail) => {
          orderDetail.product.thumbnail = `${environment.apiBaseUrl}/products/images/${orderDetail.product.thumbnail}`;
          if( this.orderDetailRequest.status == 'PROCESSING')
            this.orderDetailRequest.status = 'Đang xử lý'
          if( this.orderDetailRequest.status == 'SHIPPED')
            this.orderDetailRequest.status = 'Đã vận chuyển'
          if( this.orderDetailRequest.status == 'DELIVERED')
            this.orderDetailRequest.status = 'Đã vận chuyển'
          if( this.orderDetailRequest.status == 'PENDING')
            this.orderDetailRequest.status = 'Chưa xử lý'
          if( this.orderDetailRequest.status == 'CANCELED')
            this.orderDetailRequest.status = 'Đã hủy'
          return orderDetail;

        }
        )
        this.shipping_address = `${this.orderDetailRequest.shipping_address.city} ${this.orderDetailRequest.shipping_address.state} ${this.orderDetailRequest.shipping_address.city}`
        this.orderDetailRequest = JSON.parse(JSON.stringify(this.orderDetailRequest));


      },
      complete: () => {

      },
      error: (e) => {
        console.log(e.message)
      }
    })
  }
  updateOrder(id: number) {

    this.orderService.updateOrder(id, { status: this.orderDetailRequest!.status }).subscribe({
      next: (response: any) => {

        this.toastr.success(response.message, 'Update', {
          timeOut: 3000,
        })
        // .onHidden.subscribe(() => {
        //   this.routerNavigate.navigate(['/admin/orders']);
        // });
      },
      complete: () => {

      },
      error: (e) => {
        console.log(e.message)
      }
    })
  }
 
}
