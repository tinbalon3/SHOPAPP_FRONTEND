import { NgModule } from "@angular/core";
import { AdminComponent } from "./admin.component";
import { OrderAdminComponent } from "./order-admin/order-admin.component";
import { OrderDetailAdminComponent } from "./order-detail-admin/order-detail-admin.component";
import { ProductAdminComponent } from "./product-admin/product-admin.component";
import { CategoryAdminComponent } from "./category-admin/category-admin.component";
import { AdminRoutingModule } from "./admin-routing.module";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ProductDetailAdminComponent } from './product-detail-admin/product-detail-admin.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { UserAdminComponent } from "./user-admin/user-admin.component";
import { SkeletonLoaderComponent } from "../skeleton-loader/skeleton-loader.component";

@NgModule({
    declarations: [
        AdminComponent,
        OrderAdminComponent,
        OrderDetailAdminComponent,
        ProductAdminComponent,
        CategoryAdminComponent,
        ProductDetailAdminComponent,
        UserAdminComponent,
        SkeletonLoaderComponent
    ],
    imports: [
        AdminRoutingModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule
    ],
    exports: [
        SkeletonLoaderComponent // Export để sử dụng ngoài AdminModule
      ]
})
export class AdminModule {}