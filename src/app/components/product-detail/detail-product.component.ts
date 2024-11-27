import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';

import { ProductDetail } from '../../models/productdetail.interface';
import { ProductImages } from '../../models/productimgaes.interface';

import { CartItem } from '../../class/cart-item';

import { CartService } from '../../services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../enviroments/environment';
import { ProductDetailDTO } from '../../dtos/product_detail.dto';
import { Response } from '../../response/response';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrl: './detail-product.component.scss'
})
export class DetailProductComponent implements OnInit {


  product?: ProductDetailDTO;
  productId: number = 0;
  currentImageIndex: number = 0;
  quantity: number = 1;
  theCartItem!: CartItem ;
  constructor(private productService: ProductService,
              private cartService: CartService,
              private router: ActivatedRoute,
              private routerNavigate: Router,
              private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const idParam =  this.router.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.productId = +idParam;
      this.getProductDetail(this.productId)
    }
   
  }

 

  getProductDetail(productId:number){
    if (!isNaN(productId)) {
      this.productService.getProductDetail(productId).subscribe({
        next: (response:Response) => {

          const productDetail:ProductDetailDTO = response.data;

          if (productDetail.product_images && productDetail.product_images.length > 0) {
            productDetail.product_images.forEach((product_image: ProductImages) => {
              product_image.images_url = `${environment.apiBaseUrl}/products/images/${product_image.images_url}`
             
            })
          }
          this.product = productDetail;
          this.theCartItem = new CartItem(this.product!);
          this.theCartItem.id = this.productId;
          this.quantity = this.theCartItem.quantity;
         
          this.showImages(0);
        },
        
        error: (error) => {
          const message = error.error.message;
          this.toastr.error(message, "LỖI", {
            timeOut: 2000
          });
        }
      })
    }
  }
  showImages(index: number) {
    if (this.product && this.product.product_images && this.product.product_images.length > 0) {
      if (index < 0)
        index = 0;
      else if (index >= this.product.product_images.length)
        index = this.product.product_images.length - 1;
    }
    this.currentImageIndex = index;

  }
  thumbnailClick(index: number) {
    this.currentImageIndex = index;
  }

  nextImage() {
    this.showImages(this.currentImageIndex + 1)
  }
  previouseImage() {
    this.showImages(this.currentImageIndex - 1)
  }
  decreaseQuantity() {
    if(this.quantity > 1){
      this.quantity--;
      this.theCartItem.quantity = this.quantity;
    }
   
    
  }
  increaseQuantity() {
    this.quantity++;
    if(this.quantity > this.product!.stock){
      this.quantity = this.product!.stock
      // this.toastr.error("Quá số lượng tồn kho","THÔNG BÁO",{
      //   timeOut: 2000
      // })
    }
    this.theCartItem.quantity = this.quantity;

  }
 
  addToCart() {
    let isLogin = localStorage.getItem("isLogin")
    if (isLogin == "true") {
      
    this.cartService.addToCart(this.theCartItem,this.quantity);
    }
    else{
      this.toastr.info("Bạn cần đăng nhập để mua hàng","THÔNG BÁO",{
        timeOut: 2000
      })
      this.routerNavigate.navigate(['/login'])
    }
  }
  buyNow(){
    let isLogin = localStorage.getItem("isLogin")
    if (isLogin == "true") {
    this.cartService.addToCart(this.theCartItem,this.quantity);
    this.routerNavigate.navigate(['/orders'])
    }
    else{
      this.toastr.info("Bạn cần đăng nhập để mua hàng","THÔNG BÁO",{
        timeOut: 2000
      })
      this.routerNavigate.navigate(['/login'])
    }
  }
  getTotal(){
    return this.quantity * this.product?.price!;
  }

}
