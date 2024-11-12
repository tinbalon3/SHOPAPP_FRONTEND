import { Component, OnInit } from '@angular/core';
import { Category } from '../../../models/category.interface';
import { CategoryService } from '../../../services/category.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { CategoryDialogComponent } from '../../category-dialog/category-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { Response } from '../../../response/response';

@Component({
  selector: 'app-category-admin',
  templateUrl: './category-admin.component.html',
  styleUrl: './category-admin.component.scss'
})
export class CategoryAdminComponent implements OnInit {


  categories: Category[] = [];
  bsModalRef?: BsModalRef;
 
  constructor(
    private categoryService: CategoryService,
    private modalService: BsModalService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getCategories()
  }
  getCategories() {

    this.categoryService.getCategory().subscribe({
      next: (response:Response) => {
        this.categories = response.data.filter((category:any) => category && category.id && category.name);

      },
      error: () => {
        console.error("Error fetching categories")
      }
    })
  }
  deleteCategoryConfirm(id: number) {
    const initialState = {
      title: 'Xóa danh mục sản phẩm',
      message: 'Bạn có chắc muốn xóa danh mục sản phẩm?'
    };
    this.bsModalRef = this.modalService.show(ConfirmDialogComponent, { initialState });

    this.bsModalRef.content?.confirm.subscribe(() => {
      this.deleteCategory(id);
    });

    
  }
  openConfirmDialog() {
    const initialState = {
      title: 'Tạo danh mục sản phẩm',

    };
    this.bsModalRef = this.modalService.show(CategoryDialogComponent, { initialState });

    this.bsModalRef.content?.confirm.subscribe((response: any) => {
      let category = {
        name:response
      }
      this.createCategory(category);
    });

    
  }
  deleteCategory(id: number) {
    this.categoryService.deleteCategory(id).subscribe({
      next: (response) => {
        
        this.toastr.success(response.message,"Delete", {
          timeOut: 1000,
        }).onHidden.subscribe(()=>{
        
          location.reload()
        }
        )
      },
      error: (e) => {
        console.log("error delete category: ", e.message)
      }
    })
  }
  createCategory(name:any) {
    this.categoryService.createCategory(name).subscribe({
      next:(response:Response) => {
        this.toastr.success(response.message,"Create", {
          timeOut: 1000,
        }).onHidden.subscribe(()=>{
        
          location.reload()
        }
        )
      },
      error(err) {
        console.log(err.message)
      },
    });
  }
}
