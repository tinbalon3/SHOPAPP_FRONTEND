import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Product } from '../../models/product.interface';
import { ProductService } from '../../services/product.service';
import { ProductResponse } from '../../response/product/product.response';

import { Category } from '../../models/category.interface';
import { CategoryService } from '../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartItem } from '../../class/cart-item';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../enviroments/environment';
import { ToastrService } from 'ngx-toastr';
import { min } from 'class-validator';
import { Response } from '../../response/response';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./extra.components.scss', './home.component.scss','./extra_1.components.scss']
})
export class HomeComponent implements OnInit {

  products: Product[] = [];
  currentPage = 1;
  itemsPerPage: number = 6;
  totalElements: number = 0;
  visiblePages: number[] = [];
  keyword: string = "";
  selectedCategoryId = 0;
  categories: Category[] = [];
  theCartItem: CartItem | undefined
  isClosed = false
  priceFalse = false;
  ratingProduct = 0
  totalStars: number = 5;
  rateStar = 0
  ratings = [5, 4, 3, 2, 1];
  minPrice: number = 10000;
  maxPrice: number = 100000;
  selectedRating: number | null = null;
  @ViewChild('priceSlider', { static: true }) priceSliderRef!: ElementRef;
  @ViewChild('priceValueLower') priceValueLowerRef!: ElementRef;
  @ViewChild('priceValueUpper') priceValueUpperRef!: ElementRef;

 
  constructor(private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private routerNavigate: Router,
    private toastr: ToastrService,
    
  ) { }

  ngOnInit(): void {
    
    this.getProducts(this.keyword, this.selectedCategoryId,this.minPrice,this.maxPrice,this.rateStar, this.currentPage, this.itemsPerPage);
    this.getPriceMaxAndMin();
    this.getCategories();
  }
  ngAfterViewInit(): void {
    if (this.priceSliderRef) {
      this.updateSliderValues({ target: { value: this.maxPrice.toString() } });
    }
    
  }

  getPriceMaxAndMin(){
    this.productService.getPriceMaxAndMin().subscribe({
      next: (response:Response) => {
        if(response.status == "OK"){
          this.maxPrice = response.data.maxPrice
          this.minPrice = response.data.minPrice
        }
    } 
  })
  }
  onRatingChange(rating: number): void {
    // Nếu chọn một sao mới, cập nhật giá trị của selectedRating
    if (this.selectedRating === rating) {
      // Nếu đã chọn sao đó rồi thì bỏ chọn (reset)
      this.selectedRating = null;
      rating = 0
    } else {
      // Nếu chọn sao khác, cập nhật lại selectedRating
      this.selectedRating = rating;
    }
    this.rateStar = rating
    console.log(rating);
    
    this.getProducts(this.keyword,this.selectedCategoryId,this.minPrice,this.maxPrice,this.rateStar,this.currentPage,this.itemsPerPage)
    
  }
  isSelected(categoryId: number): boolean {
    return this.selectedCategoryId === categoryId;
  }
  updateminPrice(value: string): void {
    this.minPrice = parseInt(value, 10);  // Cập nhật minPrice khi người dùng kéo slider
  }

  updatemaxPrice(value: string): void {
    
    this.maxPrice = parseInt(value, 10);  // Cập nhật maxPrice khi người dùng nhập vào ô input
  }
  getFullStars(product: any): number {
    
    if (product.sum_of_rating === 0) {
      return 0; // Nếu không có đánh giá, trả về 0 sao đầy đủ
    }
    
    return Math.floor(product.sum_of_rating/product.number_of_rating );
  }

  hasHalfStar(product: any): boolean {
    if (product.sum_of_rating === 0) {
      return false; // Nếu không có đánh giá, trả về 0 sao đầy đủ
    }
    const rating = product.number_of_rating / product.sum_of_rating;
    return (rating % 1) >= 0.5;
  }
  trackByIndex(index: number, item: any): number {
    return index;
  }

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
  
  
  // Hàm này xử lý sự kiện nhập từ ô input của minPrice
  onMinPriceInput(event: any): void {
    let minprice = event.target.value;
    if(minprice < this.minPrice){
      this.priceFalse = true
      this.minPrice = 0
      return;
    }
    this.minPrice = parseFloat(minprice);
    this.updateSliderValues(this.minPrice);
  }

  // Hàm này xử lý sự kiện nhập từ ô input của maxPrice
  onMaxPriceInput(event: any): void {
    let maxPrice = event.target.value;
    if(maxPrice == '' || maxPrice == null) {
      event.target.value = ''
      this.priceFalse = true
      return
    }
      if(this.minPrice > this.maxPrice){
        this.priceFalse = true
        this.maxPrice = 0
        return
      }
    this.maxPrice = parseFloat(maxPrice);
  }

  // Cập nhật slider khi giá trị minPrice thay đổi
  updateSliderValues(event: any): void {
    const value = event.target.value;
    const sliderElement: HTMLInputElement = document.getElementById('price-currently') as HTMLInputElement;
    this.maxPrice = parseFloat(value)
    sliderElement.value = value.toString();
    this.searchProductsByPrice()
  }

  searchProductsByPrice() {
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.getProducts(this.keyword, this.selectedCategoryId,this.minPrice,this.maxPrice,this.rateStar, this.currentPage, this.itemsPerPage);
  }
 
  searchProducts() {
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.getProducts(this.keyword, this.selectedCategoryId,this.minPrice,this.maxPrice,this.rateStar, this.currentPage, this.itemsPerPage);
  }
  shortenDescription(description: string, maxLength: number): string {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength - 3) + "...";
  }

  getCategories() {

    this.categoryService.getCategory().subscribe({
      next: (response:Response) => {
        this.categories = response.data.filter((category:any) => category && category.id && category.name && category.isActive);
        console.log( this.categories);
        
      },
      complete: () => {

      },
      error: () => {
        console.error("Error fetching categories")
      }
    })
  }
  addToCart(id: number) {

    this.productService.getProductDetail(id).subscribe({
      next: (response:Response) => {
        this.theCartItem = response.data

        this.cartService.addToCart(this.theCartItem!, 1);
      },
      complete: () => {

        this.routerNavigate.navigate(['/orders'])
      }
    }
    )

  }
  buyNow(id: number) {
    this.addToCart(id);

  }
  updatePageSize(pageSize: string) {
    this.itemsPerPage = +pageSize;
    this.currentPage = 1;
    this.getProducts(this.keyword, this.selectedCategoryId,this.minPrice,this.maxPrice,this.rateStar, this.currentPage, this.itemsPerPage);
  }
  getProducts(keyword: string, selectedCategoryId: number,minPrice:number,maxPrice:number,rateStar:number, currentPage: number, itemsPerPage: number) {
    this.selectedCategoryId = selectedCategoryId;
    if(minPrice > maxPrice) {
      this.toastr.error("Giá không hợp lệ","Lỗi",{
        timeOut:2000
      })
      return;
    }
    this.productService.getProducts(keyword, selectedCategoryId,minPrice,maxPrice,rateStar, currentPage - 1, itemsPerPage).subscribe({
      next: (response: Response) => {
        response.data.products.forEach((product: Product) => {
          product.url = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          product.description = this.shortenDescription(product.description, 100)
        });
        this.products = response.data.products;
        this.totalElements = response.data.totalElements;
      },
      complete: () => {
      },
      error: (e) => {
        console.error(e.message)
      }
    })
  }

}
