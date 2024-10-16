import { Component } from '@angular/core';
import { Product } from '../../../models/product.interface';
import { ProductService } from '../../../services/product.service';

import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.interface';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../enviroments/environment';

@Component({
  selector: 'app-product-admin',
  templateUrl: './product-admin.component.html',
  styleUrl: './product-admin.component.scss'
})
export class ProductAdminComponent {
  
  products: Product[] = [];
 
  keyword:string ="";
  categories:Category[] = [];
  selectedCategoryId=0;
  bsModalRef?: BsModalRef;

// pagination
  currentPage = 1;
  itemsPerPage: number = 10;
  totalElements:number = 0 ;
  constructor(
    private productService: ProductService, 
    private categoryService: CategoryService,
    private router:Router,
    private toastr: ToastrService,
    private modalService: BsModalService,
   
){}
  ngOnInit(): void {
    this.getCategories()
    this.getProducts(this.keyword,this.selectedCategoryId,this.currentPage,this.itemsPerPage);
  }

  updatePageSize(pageSize: string) {
    this.itemsPerPage = +pageSize;
    this.currentPage = 1;
    this.getProducts(this.keyword,this.selectedCategoryId,this.currentPage,this.itemsPerPage);
  }
  shortenDescription(description: string, maxLength: number): string {
    if (description.length <= maxLength) {
      return description;
    }
    return description.substring(0, maxLength - 3) + "...";
  }
  openConfirmDialog(productID: number) {
    const initialState = {
      title: 'Xác nhận xóa sản phẩm',
      message: 'Bạn có chắc muốn xóa sản phẩm này?',
    };
    this.bsModalRef = this.modalService.show(ConfirmDialogComponent, { initialState });

    this.bsModalRef.content?.confirm.subscribe(() => {
      this.deleteProduct(productID);
    });

   
  }
  filterByCategory(categoryId: any): void {
  
    if(categoryId.value != null){
      this.selectedCategoryId = categoryId.value;
      this.currentPage = 0;
      this.itemsPerPage = 10;
      this.getProducts(this.keyword,this.selectedCategoryId,this.currentPage,this.itemsPerPage)
    }
    else
      this.selectedCategoryId = 0
  }
  getCategories(){
   
    this.categoryService.getCategory().subscribe({
      next:(response) => {
        this.categories = response.filter(category => category && category.id && category.name); 
        this.selectedCategoryId = this.categories[0].id
      },
      error:()=> {
          console.error("Error fetching categories")
      }
    })
  }

  getProducts(keyword:string,selectedCategoryId:number,currentPage: number, itemsPerPage: number) {
 
    this.productService.getProducts(keyword,selectedCategoryId,currentPage-1,itemsPerPage).subscribe({
      next: (response:any) => {
   
        response.products.forEach((product: Product) => {
          product.url = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          product.description = this.shortenDescription(product.description,100)
        });
       
        this.products = response.products;
        this.totalElements = response.totalElements;
      } ,
      complete:() => {
      },
      error:(e) => {
        console.error(e.error.message)
      }
    })
  }
  viewProductDetail(id:number){
    this.router.navigate(['/admin/products',id])
  }
  deleteProduct(id:number){
    this.productService.deleteProduct(id).subscribe({
      next:(response:any) =>{
        this.toastr.success(response,"Delete", {
          timeOut: 1000,
        }).onHidden.subscribe(()=>{
        
          location.reload()
        })
      },
    
      error:(e) => {
        console.log(e.message);
      }
    })
  }
}
