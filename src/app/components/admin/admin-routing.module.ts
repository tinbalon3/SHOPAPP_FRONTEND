import { Router, RouterModule, Routes } from "@angular/router";
import { AdminComponent } from "./admin.component";
import { OrderAdminComponent } from "./order-admin/order-admin.component";
import { OrderDetailAdminComponent } from "./order-detail-admin/order-detail-admin.component";
import { ProductAdminComponent } from "./product-admin/product-admin.component";
import { CategoryAdminComponent } from "./category-admin/category-admin.component";
import { NgModule } from "@angular/core";
import { ProductDetailAdminComponent } from "./product-detail-admin/product-detail-admin.component";
import { UserAdminComponent } from "./user-admin/user-admin.component";

const routes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        children : [
            {
                path: 'orders',
                component: OrderAdminComponent
            }, 
            {
                path: 'orders/:id',
                component: OrderDetailAdminComponent
            },
            {
                path: 'products',
                component: ProductAdminComponent
            },
            {
                path: 'products/edit/:id',
                component: ProductDetailAdminComponent
            },
            {
                path: 'products/add',
                component: ProductDetailAdminComponent
            },
            {
                path: 'categories',
                component: CategoryAdminComponent
            },
            {
                path: 'users',
                component: UserAdminComponent
            }
        ]
    }
];
@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class AdminRoutingModule {}