import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';

import { ProductDetail } from '../../models/productdetail.interface';
import { ProductImages } from '../../models/productimgaes.interface';

import { CartItem } from '../../class/cart-item';
import { Item } from '../../class/products';
import { Product } from '../../models/product.interface';
import { CartService } from '../../services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../enviroments/environment';

@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrl: './detail-product.component.scss'
})
export class DetailProductComponent implements OnInit {


  product?: Product;
  productId: number = 0;
  currentImageIndex: number = 0;
  quantity: number = 1;
  theCartItem!: CartItem ;
  constructor(private productService: ProductService,
              private cartService: CartService,
              private router: ActivatedRoute,
              private routerNavigate: Router
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
        next: (response) => {

          const productDetail = response.productDetailDTO;

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
        complete: () => {
            console.log(this.product)
        },
        error: (e) => {
          console.error(e.message)
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
    this.theCartItem.quantity = this.quantity;

  }
  
  addToCart() {
    this.cartService.addToCart(this.theCartItem,this.quantity);
  }
  buyNow(id:number){
    this.cartService.addToCart(this.theCartItem,this.quantity);
    this.routerNavigate.navigate(['/orders'])
  }
  getTotal(){
    return this.quantity * this.product?.price!;
  }

}
