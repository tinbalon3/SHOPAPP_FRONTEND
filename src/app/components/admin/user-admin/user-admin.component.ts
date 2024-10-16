import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { UserResponseManagement } from '../../../response/user/management/user_management.response';
import { UserPage } from '../../../response/user/management/user_page.response';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.scss'
})
export class UserAdminComponent implements OnInit {
  isLoading = false;
  userList: UserResponseManagement[] = []
  totalPages = 0
  constructor(private http: HttpClient,
    private toastr: ToastrService,
    private userService: UserService
  ) { }
  ngOnInit(): void {
    this.getAllUser()
  }
  getAllUser(){
    this.userService.getAllUser().subscribe({
      next: (response: UserPage) => {
        this.userList = response.user;
        this.totalPages = response.totalPages
      }
    })
  }
  resetPasswordUser(id: number) {
    this.isLoading = true;
    this.userService.resetPasswordUser(id).subscribe({
      next: (response: any) => {
        this.isLoading=false;
        let message = response.message
        this.toastr.success(message, "THÀNH CÔNG", {
          timeOut: 2000
        })
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 400) {
          // Truy cập thông điệp lỗi từ backend
          const errorMessage = err.error.message || 'Có lỗi xảy ra';
         

          this.toastr.error(errorMessage, "THẤT BẠI", {
            timeOut: 2000
          });
        }
      }
    })
  }
  blockOrEnableUSer(id: number,active:number) {
    this.userService.blockOrEnableUser(id,active).subscribe({
      next: (response: any) => {
       
        this.getAllUser()
        let message = response.message
        this.toastr.success(message, "THÀNH CÔNG", {
          timeOut: 2000
        })
      },
      error: (err: any) => {
        if (err.status === 400) {
          // Truy cập thông điệp lỗi từ backend
          const errorMessage = err.error.message || 'Có lỗi xảy ra';
         

          this.toastr.error(errorMessage, "THẤT BẠI", {
            timeOut: 2000
          });
        }
      }
    })
  }
}
