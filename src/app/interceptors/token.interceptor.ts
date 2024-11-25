import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';

import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Response } from '../response/response';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshingToken = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getTokenFromCookie();
    let authReq = req;

    if (token) {
      authReq = this.addTokenHeader(req, token);  // Add token if available
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 0) {
          return this.handle401Error(req, next);  // Handle 401 error
        }
        this.userService.handleLogout();
        return throwError(() =>  error);  // Return the error if not 401
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;

      const refresh_token = this.tokenService.getRefreshTokenFromCookie();
      const expiredRefreshToken = this.tokenService.getRefreshTokenExpiration();  // Get expiration time of the refresh token
     
      if (refresh_token && expiredRefreshToken && expiredRefreshToken.getTime() > Date.now()) {
        // If refresh token is valid, proceed to refresh the access token
        return this.userService.refreshToken(refresh_token).pipe(
          switchMap((newToken:Response) => {
            this.isRefreshingToken = false;
            const token = newToken.data.token;
            const refresh_token = newToken.data.refresh_token;
            const expiredDate = new Date(newToken.data.refresh_token_expired);
            this.tokenService.setTokenInCookie(token);
            this.tokenService.setRefreshTokenInCookie(refresh_token);
            this.tokenService.setExpiredRefreshTokenInCookie(expiredDate)
            return next.handle(this.addTokenHeader(request, newToken.data.token));  // Retry the original request
          }),
          catchError((error) => {
            this.isRefreshingToken = false;
            this.userService.handleLogout();  // Logout if refresh token fails
            return throwError(() => error);
          })
        );
      } else {
        // If refresh token is expired or invalid, logout the user
        this.userService.handleLogout();
        return throwError(() => new Error('Refresh token expired'));
      }
    } else {
      // If refresh token request is already in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addTokenHeader(request, token as string)))
      );
    }
  }

  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`  // Add the token to the request headers
      }
    });
  }
}


