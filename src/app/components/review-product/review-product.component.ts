import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ReviewProductRatingComponent } from '../review-product-rating/review-product-rating.component';
import { Rating } from '../../response/rating/rating.response';
import { ReviewProductRatingService } from '../../services/review-product-rating.service';
import { RatingResponse } from '../../response/rating/ratingResponse.response';
import { CartItem } from '../../class/cart-item';

@Component({
  selector: 'app-review-product',
  templateUrl: './review-product.component.html',
  styleUrl: './review-product.component.scss'
})
export class ReviewProductComponent {
  bsModalRef?: BsModalRef;
  @Input()theCartItem!: CartItem;
  ratings: RatingResponse[] = []; // Mảng chứa đánh giá
  displayedRatings: RatingResponse[] = []; // Mảng chứa các đánh giá đang hiển thị
  limit: number = 5; // Số lượng đánh giá tối đa hiển thị
  
  constructor(public modalService: BsModalService,private reviewRatingService: ReviewProductRatingService){}

  openReviewModal(): void {
    const initialState = {
      theCartItem: this.theCartItem // Truyền productId vào modal
    };
   
    this.bsModalRef = this.modalService.show(ReviewProductRatingComponent, {
      initialState,
      class: 'modal-lg' // Tùy chỉnh kích thước modal
     
    });

    this.bsModalRef.onHide?.subscribe(() => {
      this.loadRatings(this.theCartItem.id!);
    });
    
  }



  ngOnInit(): void {
    
    this.loadRatings(this.theCartItem.id!);
 
  }

  loadRatings(product_id: number) {
    this.reviewRatingService.getAllRating(product_id).subscribe({
      next: (response: RatingResponse[]) => {
        // Sắp xếp các đánh giá theo thời gian tạo, mới nhất ở đầu
        this.ratings = response.sort((a, b) => {
          return new Date(b.rating.created_at).getTime() - new Date(a.rating.created_at).getTime();
        });
  
        // Định dạng ngày tháng và cập nhật giá trị created_at
        this.ratings = this.ratings.map(rate => {
          const date = new Date(rate.rating.created_at);
          const formattedDate = date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
          rate.rating.created_at = formattedDate; // Cập nhật giá trị created_at
          return rate;
        });
  
        // Chỉ lấy số lượng đánh giá theo giới hạn đã chỉ định
        this.displayedRatings = this.ratings.slice(0, this.limit);
      }
    });
  }
  
  loadMore() {
    this.limit += 3; // Tăng số lượng đánh giá hiển thị
    this.displayedRatings = this.ratings.slice(0, this.limit); // Cập nhật các đánh giá đang hiển thị
  }
 

 
}
