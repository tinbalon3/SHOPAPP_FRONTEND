import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
  ) { }
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getTokenFromCookie();
  
    if (token) {
      // Nếu có token, thêm vào header và tiếp tục
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        }
      });
      return next.handle(req);
    } else {
      // Nếu không có token, kiểm tra refreshToken
      const refreshToken = this.tokenService.getRefreshTokenFromCookie();
      if (refreshToken) {
        // Gọi API refreshToken và đợi kết quả
        return this.userService.refreshToken(refreshToken).pipe(
          switchMap(() => {
           const newToken = this.tokenService.getTokenFromCookie();
  
            // Cập nhật req với token mới
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              }
            });
            // Tiếp tục xử lý req sau khi có token mới
            return next.handle(req);
          })
        );
      } else {
        // Nếu không có refreshToken, xử lý req như bình thường
        return next.handle(req);
      }
    }
  }
  
 

 
}