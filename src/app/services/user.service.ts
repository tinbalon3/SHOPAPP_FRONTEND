import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { RegisterDTO } from '../dtos/register.dto';
import { LoginDTO } from '../dtos/login.dto';

import { UserDetailResponse } from '../response/user/user.response'
import { TokenService } from './token.service';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { environment } from '../../enviroments/environment';
;
import { Response } from '../response/response';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from './cart.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {
  private apiRegister = environment.apiBaseUrl + '/users/register';
  private apiGetAllUser = environment.apiBaseUrl + '/users';
  private apiLogin = environment.apiBaseUrl + '/users/login';
  private apiUserDetails = environment.apiBaseUrl + '/users/details'
  private refreshTokenUrl = environment.apiBaseUrl + '/users/refreshToken';
  private apiRevokeToken = environment.apiBaseUrl + "/users/revoke-token"
  private apiSendCode = environment.apiBaseUrl + "/users/send-verification-code"
  private apiSendEmailCode = environment.apiBaseUrl + "/users/send-verification-email-code"
  private apiVerifyCode = environment.apiBaseUrl + "/users/verify";
  private apiUpdatePassword = environment.apiBaseUrl + "/users/update_password"
  private apiUpdateEmail = environment.apiBaseUrl + "/users/update_email"
  private apiBlockUser = environment.apiBaseUrl + "/users/blockOrEnable"
  private apiResetPassword = environment.apiBaseUrl + "/users/reset-password"
  private apiCallbackAuth = environment.apiBaseUrl + "/users/auth/callback"
  private isRefreshing = false;
  private apiConfig = {
    headers: this.createHeaders()
  }
  private readonly USER_KEY = 'user'
  
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept-Language': 'vi',

    })
  }
  constructor(private http: HttpClient,
    private tokenService: TokenService,
    private cookieService: CookieService,
    private cartService: CartService,
    private router: Router

  ) { }
  ngOnInit(): void {
    // const storedTimeout = localStorage.getItem('refreshTokenTimeout');
    // if (storedTimeout) {
    //   this.refreshTokenTimeout = window.setTimeout(() => {
    //     const refreshToken = this.tokenService.getRefreshTokenFromCookie();
    //     if (refreshToken) {
    //       this.refreshToken(refreshToken).subscribe();
    //     }
    //   }, +storedTimeout);
    // }
  }

  getAllUser(): Observable<Response> {
    return this.http.get<Response>(this.apiGetAllUser)
  }
  register(registerDTO: RegisterDTO): Observable<Response> {
    return this.http.post<Response>(this.apiRegister, registerDTO, this.apiConfig);
  }

  logout(): Observable<Response> {
    const refreshToken = this.tokenService.getRefreshTokenFromCookie(); // Lấy token từ localStorage hoặc sessionStorage
    return this.http.post<Response>(`${this.apiRevokeToken}`, { "refreshToken": refreshToken })
  }
  login(loginDTO: LoginDTO): Observable<Response> {
    return this.http.post<Response>(this.apiLogin, loginDTO, this.apiConfig);
  }

  private refreshTokenTimeout?: number;

  private startRefreshTokenTimer(user: any) {
    const jwtToken = user.data.token;
    const refreshToken = user.data.refresh_token;
    const expires = this.tokenService.getTokenExpiration(jwtToken);

    if (!expires) {
      console.error('Token expiration time is undefined.');
      return;
    }

    // Calculate and store timeout in localStorage
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    localStorage.setItem('refreshTokenTimeout', timeout.toString());

    this.refreshTokenTimeout = window.setTimeout(() => {
      if (!this.isRefreshing) { // To prevent multiple refresh calls
        this.isRefreshing = true;
        this.refreshToken(refreshToken).subscribe({
          next: () => {
            console.error("Token refreshed successfully");
            this.isRefreshing = false;
          },
          error: error => {
            console.error('Token refresh failed', error);
            this.cookieService.delete('token', '/', 'localhost', true, 'Strict');
            this.cookieService.delete('refresh_token', '/', 'localhost', true, 'Strict');
            this.removeUserDetail();
            this.stopRefreshTokenTimer();
            this.cartService.resetCart();
            this.router.navigate(['/login'])
          }
        });
      }
    }, timeout);
  }

  refreshToken(refreshToken: string): Observable<Response> {
    return this.http.post<Response>(`${this.refreshTokenUrl}`, { 'refreshToken': refreshToken })
      .pipe(
        map((authResponse) => {

          this.tokenService.setTokenInCookie(authResponse.data.token);
          this.tokenService.setRefreshTokenInCookie(authResponse.data.refresh_token);
          this.startRefreshTokenTimer(authResponse);
          return authResponse.data.token;
        })
      );
  }

  stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  removeUserDetail() {
    sessionStorage.removeItem(this.USER_KEY);
  }
  getUserDetails(token: string): Observable<Response> {

    return this.http.get<Response>(this.apiUserDetails,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        })
      }
    )
  }


  sendVerificationCode(userId: number, token: string): Observable<Response> {
    return this.http.get<Response>(`${this.apiSendCode}/${userId}`)
  }

  verify(code: string, email: string): Observable<Response> {
    let params = new HttpParams()
      .set('code', code.toString())
      .set('email', email.toString())
    return this.http.get<Response>(this.apiVerifyCode, {
      params: params,
      // Đảm bảo observe là một phần của cùng một đối tượng
    });
  }
  updatePassword(token: string, id: number, password: string, retype_password: string): Observable<Response> {
    return this.http.put<Response>(`${this.apiUpdatePassword}/${id}`, { 'password': password, "retype_password": retype_password }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }
  sendVerificationEmailCode(userId: number, token: string, email: string): Observable<Response> {

    return this.http.post<Response>(`${this.apiSendEmailCode}/${userId}`, { 'email': email }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }
  updateEmail(token: string, id: number, email: string): Observable<Response> {
    return this.http.put<Response>(`${this.apiUpdateEmail}/${id}`, { 'email': email }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });

  }

  saveUserDetailToLocalStorage(userResponse: UserDetailResponse) {
    try {
      if (userResponse == null || !userResponse) {
        return;
      }
      const userResponseJSON = JSON.stringify(userResponse);
      sessionStorage.setItem(this.USER_KEY, userResponseJSON);

    }
    catch (e) {
      console.log(e)
    }
  }
  saveUserDetailToSessionStorage(userResponse: UserDetailResponse) {
    try {
      if (userResponse == null || !userResponse) {
        return;
      }
      const userResponseJSON = JSON.stringify(userResponse);
      sessionStorage.setItem(this.USER_KEY, userResponseJSON);

    }
    catch (e) {
      console.log(e)
    }
  }

  callbackAuth(code: string): Observable<any> {
    let params = new HttpParams()
      .set('code', code.toString())
    return this.http.get(this.apiCallbackAuth, { params })
  }


  getUserDetailFromSessionStorage() {
    const userDetailString = sessionStorage.getItem(this.USER_KEY);
    if (userDetailString) {
      try {
        const userDetail = JSON.parse(userDetailString);
        return userDetail;
      } catch (error) {
        console.error('Error parsing user detail from localStorage:', error);
        return null;
      }
    }
    return null;
  }
  getUserDetailFromLocalStorage() {
    const userDetailString = localStorage.getItem(this.USER_KEY);
    if (userDetailString) {
      try {
        const userDetail = JSON.parse(userDetailString);
        return userDetail;
      } catch (error) {
        console.error('Error parsing user detail from localStorage:', error);
        return null;
      }
    }
    return null;
  }
  updateUser(token: string, updateUserDTO: UpdateUserDTO): Observable<any> {
    let userId = this.tokenService.getUserId();
    return this.http.put(`${this.apiUserDetails}/${userId}`, updateUserDTO, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    })
  }

  blockOrEnableUser(id: number, active: number): Observable<any> {
    return this.http.put(`${this.apiBlockUser}/${id}/${active}`, null)
  }
  resetPasswordUser(id: number): Observable<any> {
    return this.http.put(`${this.apiResetPassword}/${id}`, null)
  }

}
