import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs';
import { Response } from '../response/response';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private userService: UserService
  ) {}

  canActivate(): Observable<boolean> {
    const isTokenExpired = this.tokenService.isTokenExpired();
    
    const isLogin = this.userService.checkLogin()
    
    if (!isTokenExpired && isLogin) {
      return of(true);
    }
    else {
      const refresh_token = this.tokenService.getRefreshTokenFromCookie();
      const expiredRefreshToken = this.tokenService.getRefreshTokenExpiration(); // Lấy thời gian hết hạn từ cookie hoặc localStorage

      if (!refresh_token || !expiredRefreshToken) {
        this.router.navigate(['/login']);
        return of(false);  // Nếu không có refresh token hoặc thời gian hết hạn
      }
      if (refresh_token && expiredRefreshToken.getTime() > Date.now()) {
        return this.tokenService.refreshToken(refresh_token).pipe(
          switchMap((newToken: Response) => {
             // Nếu refresh thành công, lưu token mới và cho phép truy cập
             this.tokenService.setTokenInCookie(newToken.data.token);
             this.tokenService.setRefreshTokenInCookie(newToken.data.refresh_token);    
             return of(true);
            }),
            catchError(() => {
              // Nếu refresh thất bại, chuyển hướng đến trang login
              this.router.navigate(['/login']);
              return of(false);
            })
          );
        } else {
          // Nếu không có refresh token, chuyển hướng đến trang login
          this.router.navigate(['/login']);
          return of(false);
        }
      }
      
    }
   
   
  }



