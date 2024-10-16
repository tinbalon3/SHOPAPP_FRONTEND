import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.interface';
import { ProductService } from '../../services/product.service';
import { ProductResponse } from '../../response/product/product.response';

import { Category } from '../../models/category.interface';
import { CategoryService } from '../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartItem } from '../../class/cart-item';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../enviroments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./extra.components.scss', './home.component.scss']
})
export class HomeComponent implements OnInit {

  products: Product[] = [];
  currentPage = 1;
  itemsPerPage: number = 9;
  totalElements: number = 0;
  visiblePages: number[] = [];
  keyword: string = "";
  selectedCategoryId = 0;
  categories: Category[] = [];
  theCartItem: CartItem | undefined
  constructor(private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private routerNavigate: Router
  ) { }
  ngOnInit(): void {

    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
    this.getCategories();
  }
  searchProducts() {
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }
  shortenDescription(description: string, maxLength: number): string {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength - 3) + "...";
  }

  getCategories() {

    this.categoryService.getCategory().subscribe({
      next: (response) => {
        this.categories = response.filter(category => category && category.id && category.name && category.isActive);

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
      next: (response) => {
        this.theCartItem = response.productDetailDTO

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
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }
  getProducts(keyword: string, selectedCategoryId: number, currentPage: number, itemsPerPage: number) {
    this.productService.getProducts(keyword, selectedCategoryId, currentPage - 1, itemsPerPage).subscribe({
      next: (response: any) => {

        response.products.forEach((product: Product) => {
          product.url = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          product.description = this.shortenDescription(product.description, 100)
        });
        this.products = response.products;

        this.totalElements = response.totalElements;
      },
      complete: () => {
      },
      error: (e) => {
        console.error(e.message)
      }
    })
  }

}
