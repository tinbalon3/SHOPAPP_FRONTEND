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
  
    private cartService: CartService,
    private tokenService: TokenService,
    private toastr: ToastrService) { }
  ngOnInit(): void {
    this.userId = this.tokenService.getUserId();
    this.userResponse = this.userService.getUserDetailFromLocalStorage();

  }
  navigateLogin(arg0: string) {
    localStorage.removeItem("isVerifyOTP")
    this.router.navigate([arg0])
    }
  logout() {
    this.cartService.persistCartItems()
    this.userService.logout().subscribe({
      next: (response: Response) => {
        if (response.status == "OK") {
          
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
}
