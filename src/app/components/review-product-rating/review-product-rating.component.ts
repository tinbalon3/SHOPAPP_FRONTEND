import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TokenService } from '../../services/token.service';
import { RatingDTO } from '../../dtos/rate.dto';
import { ReviewProductRatingService } from '../../services/review-product-rating.service';
import { CartItem } from '../../class/cart-item';
import { environment } from '../../../enviroments/environment';
import { Response } from '../../response/response';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-review-product-rating',
  templateUrl: './review-product-rating.component.html',
  styleUrl: './review-product-rating.component.scss'
})
export class ReviewProductRatingComponent implements OnInit{
  @Input() theCartItem!: CartItem  ;
  rate: number = 5;
  ratingText: string = 'Tuyệt vời';
  content: string ='';
  ratingMessages: string[] = ['Tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời'];
  user_id:number = 0;
  onRatingAdded!: () => void;
  ratings: any[] = []; // Mảng chứa đánh giá
  displayedRatings: any[] = []; // Mảng chứa các đánh giá đang hiển thị
  limit: number = 3; // Số lượng đánh giá tối đa hiển thị

 
  constructor(public bsModalRef: BsModalRef,
    private router:ActivatedRoute,
    private tokenSerivce: TokenService,
    private reviewRatingService: ReviewProductRatingService,
    private toastr: ToastrService) {}
  
  ngOnInit(): void {
    if(!this.theCartItem.thumbnail.includes(`${environment.apiBaseUrl}/products/images/`)){
      this.theCartItem.thumbnail = `${environment.apiBaseUrl}/products/images/${this.theCartItem.thumbnail}`
    }
  
    this.user_id = this.tokenSerivce.getUserId();
  }
  closeModal(): void {
    this.bsModalRef.hide();  // Đóng modal
  }

  rateProduct(star: number) {
    this.rate = star;
   this.ratingText = this.ratingMessages[star - 1];
  
    
  }
  ratingProduct(){
    const rate = new RatingDTO(this.user_id,this.theCartItem?.id!,this.content,this.rate);
    this.reviewRatingService.ratingProduct(rate).subscribe({
     next:(response:Response) => {
      this.toastr.success(response.message,"THÔNG BÁO",{
        timeOut:4000
      })
      this.closeModal();
     },
     error:(error:any) => {
      this.toastr.error(error.error.message,"LỖI",{
        timeOut:4000
      })
     
     }
    })
  }
}
