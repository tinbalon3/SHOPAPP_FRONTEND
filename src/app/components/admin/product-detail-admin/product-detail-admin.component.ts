import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../models/product.interface';
import { ProductImages } from '../../../models/productimgaes.interface';

import { FormBuilder, FormGroup } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.interface';
import { environment } from '../../../../enviroments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-detail-admin',
  templateUrl: './product-detail-admin.component.html',
  styleUrl: './product-detail-admin.component.scss'
})
export class ProductDetailAdminComponent implements OnInit {
  files: File[] = [];
  idImages: number [] = [];
  productInfoForm!: FormGroup;
  product?: Product;
  productId: number = 0;
  categories: Category[] = [];
  productImages: any[] = []
  selectedFiles: File[] = [];
  updateImages: boolean[] = [];
  maximum_images = 5;
  isLoading = false
  additionalImageInputs: number[] = [];
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.productId = +idParam;
    }
    this.initializeForm();
    this.getCategory();
    this.getProductDetail(this.productId);

  }
  initializeForm(): void {
    this.productInfoForm = this.formBuilder.group({
      productId: [{ value: '', disabled: true }],
      productName: [''],
      productPrice: [''],
      productDescription: [''],
      productCategory: ['']
    });


  }
  getCategory() {
    this.categoryService.getCategory().subscribe({
      next: (response: any) => {
        this.categories = response;
      },
      complete: () => {

      },
      error: (e) => {
        console.log(e)
      }
    })
  }
  getProductDetail(productId:number) {
    this.isLoading = true
    if (!isNaN(productId)) {
      this.productService.getProductDetail(productId).subscribe({
        next: (response) => {
          this.isLoading = false
          const productDetail = response.productDetailDTO;

          if (productDetail.product_images && productDetail.product_images.length > 0) {
            productDetail.product_images.forEach((product_image: ProductImages) => {
              product_image.images_url = `${environment.apiBaseUrl}/products/images/${product_image.images_url}`

            })
          }
          this.product = productDetail;
          this.additionalImageInputs = Array.from({ length: this.maximum_images - this.product?.product_images.length! }, (_, i) => i);          this.productInfoForm.patchValue({
            productId: this.productId,
            productName: this.product!.name,
            productPrice: this.product!.price,
            productDescription: this.product!.description,
            productCategory: this.product!.category_id
          });

        },
        complete: () => {

        },
        error: (e) => {
          console.error(e.error.message)
        }
      })
    }
  }

  saveProductInfo(): void {
    const product = {
      name: this.productInfoForm.controls['productName'].value,
      price: this.productInfoForm.controls['productPrice'].value,
      description: this.productInfoForm.controls['productDescription'].value,
      category_id: this.productInfoForm.controls['productCategory'].value,
    }
    this.isLoading = true
    this.productService.updateProduct(product,this.productId).subscribe({
      next:(response) => {
        this.isLoading = false
        this.toastr.success("Thay đổi thông tin sản phẩm thành công", "THÀNH CÔNG", {
          timeOut: 2000
        })
        this.product = response;
        this.product!.id = this.productId;
        location.reload()
      },
      error:(e) => {
        this.isLoading = false
        this.toastr.error("Thay đổi thất bại", "THÀNH CÔNG", {
          timeOut: 2000
        })
        console.log("Update product failed : ",e.message,product)
      }
    });
  }
  filterByCategory(categoryId: any): void {
    if (categoryId.value) {

    }
  }
  onFileChange(file:any, id: number,updateImage:boolean) {
    if (file.target.files.length > 0) {
      this.selectedFiles.push(file.target.files[0])
      this.idImages.push(id);
      this.updateImages.push(updateImage);
    }
    const input = file.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        const imgElement = document.getElementById('productImage-' + id) as HTMLImageElement;
        const undoButton = document.getElementById('undoButton-' + id) as HTMLButtonElement;

        reader.onload = (e: any) => {
            // Save the current image URL for undo
            imgElement.setAttribute('data-original-src', imgElement.src);
            imgElement.src = e.target.result;
            undoButton.style.display = 'inline';
        };

        reader.readAsDataURL(input.files[0]);
    }
   
  }
  undoImageChange(imageId: number): void {
    const imgElement = document.getElementById('productImage-' + imageId) as HTMLImageElement;
    const undoButton = document.getElementById('undoButton-' + imageId) as HTMLButtonElement;

    // Restore the original image URL
    imgElement.src = imgElement.getAttribute('data-original-src')!;
    undoButton.style.display = 'none';
}
  saveProductImages() {
    const formData = new FormData();
    for (let i = 0; i < this.selectedFiles.length; i++) {
      formData.append('images', this.selectedFiles[i]);
      formData.append('imageIds', this.idImages[i].toString());
      formData.append('updateImages', this.updateImages[i].toString());
    }
    this.isLoading = true
    this.productService.updateImages(formData, this.productId).subscribe({
     next:(response:any) => {
      this.isLoading = false

        this.toastr.success(`Images updated successfully: ${response}`, "THÀNH CÔNG", {
          timeOut: 2000
        })
       },
     
      error:(err:any) => {
        this.isLoading = false
       
        this.toastr.success(`Error updating images: ${err.message}`, "THÀNH CÔNG", {
          timeOut: 2000
        })
      }
   
   
   })  
  }
}
