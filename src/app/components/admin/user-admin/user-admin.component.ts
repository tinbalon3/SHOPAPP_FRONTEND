import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { UserResponseManagement } from '../../../response/user/management/user_management.response';
import { UserPage } from '../../../response/user/management/user_page.response';
import { ToastrService } from 'ngx-toastr';
import { Response } from '../../../response/response';

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
      next: (response: Response) => {
       
        
        this.userList = response.data.user;
        this.totalPages = response.data.totalPages
      }
    })
  }
  resetPasswordUser(id: number) {
    this.isLoading = true;
    this.userService.resetPasswordUser(id).subscribe({
      next: (response: Response) => {
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
      next: (response: Response) => {
       
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
