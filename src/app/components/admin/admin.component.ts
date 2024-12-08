import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { UserService } from '../../services/user.service';
import { UserDetailResponse } from '../../response/user/user.response';
import { ToastrService } from 'ngx-toastr';
import { Response } from '../../response/response';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  userReponse?:UserDetailResponse | null;
  adminComponent:string = 'orders'
  constructor(
    private router: Router, 
    private tokenService: TokenService,
    private userService: UserService,
    private toastr: ToastrService
  ) { }
  ngOnInit(): void {
    this.userReponse = this.userService.getUserDetailFromSessionStorage();
  }
  logout() {
   
    this.userService.logout().subscribe({
      next: (response: Response) => {
        if (response.status == 200) {
          
          this.toastr.success("Bạn đã đăng xuất thành công.", "THÔNG BÁO", {
            timeOut: 2000,
          });
          // Xóa token và refresh_token trong cookie
          this.userService.handleLogout()
        }

      },
      error: (error: any) => {
        const message = error.error.message;
        this.userService.handleLogout()

        this.toastr.error(message, "LỖI", {
          timeOut: 2000
        });
      }
    });
  }
  showComponent(component:string){
    this.adminComponent = component;
  }
}
