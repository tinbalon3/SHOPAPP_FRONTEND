import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ReviewProductRatingComponent } from '../review-product-rating/review-product-rating.component';
import { Rating } from '../../response/rating/rating.response';
import { ReviewProductRatingService } from '../../services/review-product-rating.service';
import { RatingResponse } from '../../response/rating/ratingResponse.response';
import { CartItem } from '../../class/cart-item';
import { TokenService } from '../../services/token.service';
import { Router } from '@angular/router';
import { Response } from '../../response/response';

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
  ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  constructor(public modalService: BsModalService,
    private reviewRatingService: ReviewProductRatingService,
    private tokenService:TokenService,
    private router:Router){}

  // openReviewModal(): void {
  //   if(this.tokenService.getTokenFromCookie() == null || this.tokenService.getTokenFromCookie() == '') {
  //     this.router.navigate(['/login'])
  //     return
  //   }
  //   const initialState = {
  //     theCartItem: this.theCartItem // Truyền productId vào modal
  //   };
   
  //   this.bsModalRef = this.modalService.show(ReviewProductRatingComponent, {
  //     initialState,
  //     class: 'modal-lg' // Tùy chỉnh kích thước modal
     
  //   });

  //   this.bsModalRef.onHide?.subscribe(() => {
  //     this.loadRatings(this.theCartItem.id!);
  //   });
    
  // }
  getStarClasses(product: any, index: number): string {
    const fullStars = this.getFullStars(product);
    const halfStar = this.hasHalfStar(product);
  
    // Tạo chuỗi class dựa trên điều kiện
    if (index < fullStars) {
      return 'fas fa-star';
    } else if (index === fullStars && halfStar) {
      return 'fas fa-star-half-alt';
    } else {
      return 'far fa-star';
    }
  }
  getStarUserClasses(rating: number, index: number): string {
    const fullStars = Math.floor(rating);  // Số lượng ngôi sao đầy
    const hasHalfStar = rating % 1 !== 0;  // Kiểm tra có nửa sao không
    
    if (index < fullStars) {
      // Nếu chỉ số nhỏ hơn số sao đầy, trả về class sao đầy
      return 'fas fa-star';
    } else if (index === fullStars && hasHalfStar) {
      // Nếu chỉ số trùng với vị trí nửa sao, trả về class nửa sao
      return 'fas fa-star-half-alt';
    } else {
      // Nếu không, trả về class sao trống
      return 'far fa-star';
    }
  }
  
  
  
  hasHalfStar(product: any): boolean {
    if (product.sum_of_rating === 0) {
      return false; // Nếu không có đánh giá, trả về 0 sao đầy đủ
    }
    const rating = product.number_of_rating / product.sum_of_rating;
    return (rating % 1) >= 0.5;
  }

  getFullStars(product: any): number {
    
    if (product.sum_of_rating === 0) {
      return 0; // Nếu không có đánh giá, trả về 0 sao đầy đủ
    }
    
    return Math.floor(product.sum_of_rating/product.number_of_rating );
  }


  ngOnInit(): void {
    
    this.loadRatings(this.theCartItem.id!);
 
  }

  loadRatings(product_id: number) {
    this.reviewRatingService.getAllRating(product_id).subscribe({
      next: (response: Response) => {
        // Sắp xếp các đánh giá theo thời gian tạo, mới nhất ở đầu
        this.ratings = response.data.sort((a:any, b:any) => {
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
        this.calculateRatingCounts();
      }
    });
  }
  
  loadMore() {
    this.limit += 3; // Tăng số lượng đánh giá hiển thị
    this.displayedRatings = this.ratings.slice(0, this.limit); // Cập nhật các đánh giá đang hiển thị
  }
 
  calculateRatingCounts(): void {
    this.ratings.forEach((ratingResponse:RatingResponse) => {
      const ratingValue = ratingResponse.rating.rating;
      if (ratingValue >= 1 && ratingValue <= 5) {
        this.ratingCounts[ratingValue]++;
      }
    });
  }
  getRatingPercentage(star: number): number {
    return this.ratings.length > 0 ? (this.ratingCounts[star] / this.ratings.length) * 100 : 0;
  }
}
