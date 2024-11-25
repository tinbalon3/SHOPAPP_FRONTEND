import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Response } from '../../response/response';
import { UserDetailResponse } from '../../response/user/user.response';

@Component({
  selector: 'app-authcallback',
  templateUrl: './authcallback.component.html',
  styleUrl: './authcallback.component.scss'
})
export class AuthcallbackComponent implements OnInit {
  userResponse!: UserDetailResponse | null;
  constructor(private router: Router,
    private tokenService: TokenService,
  
    private userService: UserService,
    private activeRouter: ActivatedRoute,
    private toastr: ToastrService) { }
  ngOnInit(): void {
    const code = this.activeRouter.snapshot.queryParamMap.get("code")
  

    if (code != null) {
      this.userService.callbackAuth(code).subscribe({
        next: (response: Response) => {
          this.userService.isLogin()
         
          const token = response.data.token;
          const refresh_token = response.data.refresh_token;
          const expiredDate = new Date(response.data.refresh_token_expired);
          // Đặt token và refresh token vào cookie
          this.tokenService.setTokenInCookie(token);
          this.tokenService.setRefreshTokenInCookie(refresh_token);
          this.tokenService.setExpiredRefreshTokenInCookie(expiredDate)
        
          // Gọi API lấy chi tiết người dùng
          this.getUserDetailsAndNavigate(token);

        },
        error: (error: any) => {

          const message = error.error.message;
          this.toastr.error(message, "LỖI", {
            timeOut: 2000
          });

        }
      })
    }


  }

  navigateBasedOnUserRole(roleName: string) {
    if (roleName === 'admin') {
      this.router.navigate(['/admin/orders']);
    } else if (roleName === 'user') {
      this.router.navigate(['/']);
    }
  }
  getUserDetailsAndNavigate(token: string) {

    this.userService.getUserDetails(token).subscribe({
      next: (userResponse: Response) => {

        this.userResponse = {
          ...userResponse.data,
          date_of_birth: new Date(userResponse.data.date_of_birth)
        };

        // Lưu trữ chi tiết người dùng dựa trên tùy chọn "remember me"
       
          this.userService.saveUserDetailToLocalStorage(this.userResponse!);
        

        // Điều hướng dựa trên vai trò người dùng
        // this.navigateBasedOnUserRole(userResponse.data.role_id.name);
        this.router.navigate(['/']);
      },
      error: (error) => {
        const message = error.error.message;
        this.toastr.error(message, "LỖI", {
          timeOut: 2000
        });
      }
    });
  }
}
