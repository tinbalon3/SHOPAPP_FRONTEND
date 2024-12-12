import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../models/product.interface';
import { ProductImages } from '../../../models/productimgaes.interface';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.interface';
import { environment } from '../../../../enviroments/environment';
import { ToastrService } from 'ngx-toastr';
import { ProductDetailDTO } from '../../../dtos/product_detail.dto';
import { Response } from '../../../response/response';

@Component({
  selector: 'app-product-detail-admin',
  templateUrl: './product-detail-admin.component.html',
  styleUrl: './product-detail-admin.component.scss'
})
export class ProductDetailAdminComponent implements OnInit {
  files: File[] = [];
  idImages: number [] = [];
  productInfoForm!: FormGroup;
  productDetail?: ProductDetailDTO;
  productId: number = 0;
  categories: Category[] = [];
  productImages: any[] = []
  selectedFiles: File[] = [];
  updateImages: boolean[] = [];
  maximum_images = 5;
  isAddProduct=false;
  isLoading = false
  isChanged = false; // Cờ theo dõi thay đổi
  additionalImageInputs: number[] = [];
  addImages: number[] = [];
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
      this.getProductDetail(this.productId);
      
    }
    else {
      this.isAddProduct=true;
      this.addImages.length = 5;
    }
    this.initializeForm();
    this.getCategory();
    

  }
  initializeForm(): void {
    this.productInfoForm = this.formBuilder.group({
      productId: [{ value: '', disabled: true }],
      productName: [],
      productPrice: [, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
      productDescription: [],
      productCategory: [],
      productStock: []
    });

    

  }
  getCategory() {
    this.categoryService.getCategory().subscribe({
      next: (response: Response) => {
        this.categories = response.data;
        this.productInfoForm.get('productCategory')?.setValue(this.categories[0].id);
      },
      error: (e) => {
        this.toastr.error(e.error.message, "THÔNG BÁO", {
          timeOut: 2000
        })
      }
    })
  }

  getProductDetail(productId:number) {
    this.isLoading = true
    if (!isNaN(productId)) {
      this.productService.getProductDetail(productId).subscribe({
        next: (response:Response) => {
          this.isLoading = false
          this.productDetail = response.data;
          if (this.productDetail?.product_images && this.productDetail?.product_images.length > 0) {
            this.productDetail?.product_images.forEach((product_image: ProductImages) => {
              product_image.images_url = `${environment.apiBaseUrl}/products/images/${product_image.images_url}`

            })
          }
          this.additionalImageInputs = Array.from({ length: this.maximum_images - this.productDetail?.product_images.length! }, (_, i) => i);          
          this.productInfoForm.patchValue({
            productId: this.productId,
            productName: this.productDetail!.name,
            productPrice: this.productDetail!.price,
            productDescription: this.productDetail!.description,
            productCategory: this.productDetail!.category_id,
            productStock:this.productDetail!.stock
          });
          this.productInfoForm.valueChanges.subscribe(() => {
            this.isChanged = true;
          });
        },
        error: (e) => {
          this.toastr.error(e.error.message, "THÔNG BÁO", {
            timeOut: 2000
          })
        }
      })
    }
  }

  addProduct(): void {
    const formData = new FormData();
  
    // Kiểm tra `productInfoForm` trước
    if (this.productInfoForm.invalid) {
      this.toastr.error("Điền sai thông tin sản phẩm. Vui lòng kiểm tra lại.", "LỖI", {
        timeOut: 3000,
      });
      return;
    }
  
    // Lấy dữ liệu từ form và chuẩn bị JSON
    const product = {
      name: this.productInfoForm.controls['productName'].value?.trim() || '',
      price: this.productInfoForm.controls['productPrice'].value || 0,
      description: this.productInfoForm.controls['productDescription'].value?.trim() || '',
      category_id: this.productInfoForm.controls['productCategory'].value || null,
      stock: this.productInfoForm.controls['productStock'].value || 0,
    };
    
  
    // Kiểm tra logic dữ liệu
    if (!product.name || product.name.length === 0) {
      this.toastr.error("Tên sản phẩm không được để trống.", "LỖI", { timeOut: 3000 });
      return;
    }
    if (product.price <= 0) {
      this.toastr.error("Giá sản phẩm phải lớn hơn 0.", "LỖI", { timeOut: 3000 });
      return;
    }
    if (product.stock <= 0) {
      this.toastr.error("Số lượng sản phẩm không hợp lệ.", "LỖI", { timeOut: 3000 });
      return;
    }
  
    // Thêm JSON vào FormData
    const jsonBlob = new Blob([JSON.stringify(product)], { type: 'application/json' });
    formData.append('product', jsonBlob, 'product.json');
  
    // Kiểm tra file hình ảnh
    if (this.selectedFiles.length < 3) {
      this.toastr.error("Cần có ít nhất 3 hình ảnh sản phẩm.", "LỖI", { timeOut: 3000 });
      return;
    }
  
    // Kiểm tra từng file
    for (const file of this.selectedFiles) {
      if (!file.type.match('image.*')) {
        this.toastr.error(`File ${file.name} không phải là hình ảnh hợp lệ.`, "LỖI", { timeOut: 3000 });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error(`File ${file.name} vượt quá kích thước cho phép (5MB).`, "LỖI", { timeOut: 3000 });
        return;
      }
      formData.append('images', file);
    }
  
    // Gửi request nếu tất cả đều hợp lệ
    this.isLoading = true;
    this.productService.addProduct(formData).subscribe({
      next: (response: Response) => {
        this.isLoading = false;
        this.toastr.success("Thay đổi thông tin sản phẩm thành công", "THÀNH CÔNG", {
          timeOut: 2000,
        });
        this.productDetail = response.data;
        this.productDetail!.id = this.productId;
        location.reload();
      },
      error: (e) => {
        this.isLoading = false;
        console.log(e);
        this.toastr.error(e.error.message, "THẤT BẠI", {
          timeOut: 2000,
        });
      },
    });
  }
  

  saveProduct(): void {
    if(this.isChanged || this.selectedFiles.length > 0) {
      const formData = new FormData();
      if (
        this.idImages.length !== this.selectedFiles.length ||
        this.updateImages.length !== this.selectedFiles.length
      ) {
        this.toastr.error('Dữ liệu hình ảnh không đồng bộ', 'LỖI', {
          timeOut: 3000,
        });
        return;
      }
      else {
        const imageData = {
          imageIds: this.idImages,
          updateImages: this.updateImages,
        };
    
        const imageBlob = new Blob([JSON.stringify(imageData)], { type: 'application/json' });
        formData.append('imageData', imageBlob, 'imageData.json');
      }
      const product = {
        name: this.productInfoForm.controls['productName'].value,
        price: this.productInfoForm.controls['productPrice'].value,
        description: this.productInfoForm.controls['productDescription'].value,
        category_id: this.productInfoForm.controls['productCategory'].value,
        stock: this.productInfoForm.controls['productStock'].value,
      }
      // Chuyển đổi JSON thành Blob để gửi qua FormData
      const jsonBlob = new Blob([JSON.stringify(product)], { type: 'application/json' });
  
      // Thêm tệp JSON vào FormData
      formData.append('product', jsonBlob, 'product.json');
  
      for (const file of this.selectedFiles) {
        formData.append('images', file);
      }
        
      this.isLoading = true
      this.productService.updateProduct(this.productId,formData).subscribe({
        next:(response:Response) => {
          this.isLoading = false
          this.toastr.success("Thay đổi thông tin sản phẩm thành công", "THÔNG BÁO", {
            timeOut: 2000
          })
          this.productDetail = response.data;
          this.productDetail!.id = this.productId;
          location.reload()
        },
        error:(error:any) => {
          this.isLoading = false
          this.toastr.error(error.error.message, "THÔNG BÁO", {
            timeOut: 2000
          })
          
        }
      });
    }
    else {
      this.toastr.info("Không có thay đổi", "THÔNG BÁO", {
        timeOut: 2000
      })
    }
  
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
  
}
