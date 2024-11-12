import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserDetailResponse } from '../../response/user/user.response';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { CartService } from '../../services/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { Response } from '../../response/response';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  userResponse!: UserDetailResponse | null;
  userId!: number;
  isLoading = false;
  constructor(private userService: UserService,
    private router: Router,
    private tokenService: TokenService,
    private cartService: CartService,
    private activeRouter: ActivatedRoute,
    private cookieService: CookieService,
    private toastr: ToastrService) { }
  ngOnInit(): void {
    const code = this.activeRouter.snapshot.queryParamMap.get("code")

    this.isLoading = true
    if (code != null) {
      this.userService.callbackAuth(code).subscribe({
        next: (response: Response) => {

          this.isLoading = false
          const token = response.data.token;
          const refresh_token = response.data.refresh_token;

          // Đặt token và refresh token vào cookie
          this.tokenService.setTokenInCookie(token);
          this.tokenService.setRefreshTokenInCookie(refresh_token);
          debugger
          // Gọi API lấy chi tiết người dùng
          this.getUserDetailsAndNavigate(token, false);

        },
        error: (error: any) => {
          this.isLoading = false
          const message = error.error.message;
          this.toastr.error(message, "LỖI", {
            timeOut: 2000
          });

        }
      })
    }
    else {
      this.isLoading = false
      this.userId = this.tokenService.getUserId();
      this.userResponse = this.userService.getUserDetailFromSessionStorage();
    }


  }
  getUserDetailsAndNavigate(token: string, rememberMe: boolean) {
    debugger
    this.userService.getUserDetails(token).subscribe({
      next: (userResponse: Response) => {

        this.userResponse = {
          ...userResponse.data,
          date_of_birth: new Date(userResponse.data.date_of_birth)
        };

        // Lưu trữ chi tiết người dùng dựa trên tùy chọn "remember me"
        if (rememberMe) {
          // Lưu trữ lâu dài
          this.userService.saveUserDetailToLocalStorage(this.userResponse!);
        } else {
          this.userService.saveUserDetailToSessionStorage(this.userResponse!);
        }

        // Điều hướng dựa trên vai trò người dùng
        this.navigateBasedOnUserRole(userResponse.data.role_id.name);
      },
      error: (error) => {
        const message = error.error.message;
        this.toastr.error(message, "LỖI", {
          timeOut: 2000
        });
      }
    });
  }

  navigateBasedOnUserRole(roleName: string) {
    if (roleName === 'admin') {
      this.router.navigate(['/admin/orders']);
    } else if (roleName === 'user') {
      this.router.navigate(['/']);
    }
  }
  logout() {
    this.cartService.persistCartItems()
    this.userService.logout().subscribe({
      next: (response: Response) => {
        if (response.status == "OK") {

          this.cookieService.delete('token', '/', 'localhost', true, 'Strict');
          this.cookieService.delete('refresh_token', '/', 'localhost', true, 'Strict');
          this.userService.removeUserDetail();
          this.cartService.resetCart();
          this.userService.stopRefreshTokenTimer();
          this.router.navigate(['/login'])
        }

      },
      error: (error: any) => {
        const message = error.error.message;
        this.toastr.error(message, "LỖI", {
          timeOut: 2000
        });
      }


    });
  }
}
