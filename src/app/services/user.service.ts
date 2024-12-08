import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { RegisterDTO } from '../dtos/register.dto';
import { LoginDTO } from '../dtos/login.dto';

import { UserDetailResponse } from '../response/user/user.response'
import { TokenService } from './token.service';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { environment } from '../../enviroments/environment';
;
import { Response } from '../response/response';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from './cart.service';
import { Router } from '@angular/router';
import { Toast, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {
  private apiRegister = environment.apiBaseUrl + '/users/register';
  private apiGetAllUser = environment.apiBaseUrl + '/users';
  private apiLogin = environment.apiBaseUrl + '/users/auth/login';
  private apiLoginGoogle = environment.apiBaseUrl + '/users/auth/googleLogin';
  private apiUserDetails = environment.apiBaseUrl + '/users/details';
  private apiRevokeToken = environment.apiBaseUrl + "/users/logout"
 
  private apisendOTPResetPassword = environment.apiBaseUrl + "/users/reset-password/send-verification-code"
  private apiSendEmailCode = environment.apiBaseUrl + "/users/change-email/send-verification-email-code"
  private apiVerifyRegisterCode = environment.apiBaseUrl + "/users/register/verify";
  private apiCheckEmailIsExist = environment.apiBaseUrl + "/users/reset-password/check-email-exist";
  private apiVerifyCodeForgotPassword = environment.apiBaseUrl + "/users/email/verify";

  private apiUpdatePassword = environment.apiBaseUrl + "/users/update-password"
  private apiUpdateEmail = environment.apiBaseUrl + "/users/update-email"
  private apiBlockUser = environment.apiBaseUrl + "/users/blockOrEnable"
  private apiResetPassword = environment.apiBaseUrl + "/users/reset-password"
  private apiCallbackAuth = environment.apiBaseUrl + "/users/auth/callback"
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
    private router: Router,
    private toastr: ToastrService

  ) { }
  ngOnInit(): void {

  }
  loginWithGoogle(): Observable<Response> {
    return this.http.get<Response>(this.apiLoginGoogle)
  }
  isLogin() {
    return localStorage.setItem("isLogin", true + '');
  }
  checkLogin() {
    return localStorage.getItem("isLogin");
  }
  getAllUser(): Observable<Response> {
    return this.http.get<Response>(this.apiGetAllUser)
  }
  register(registerDTO: RegisterDTO): Observable<Response> {
    return this.http.post<Response>(this.apiRegister, registerDTO, this.apiConfig);
  }

 

  login(loginDTO: LoginDTO): Observable<Response> {
    return this.http.post<Response>(this.apiLogin, loginDTO, this.apiConfig);
  }

  handleLogout() {
  
    this.cartService.resetCart();
    this.cookieService.delete('token', '/');
    this.cookieService.delete('refresh_token', '/');
    this.cookieService.delete('refresh_token_expired', '/');
    this.removeUserDetailInLocal()
    localStorage.removeItem('isLogin')
    this.router.navigate(['/login']);
  }

  logout(): Observable<Response> {
    const refreshToken = this.tokenService.getRefreshTokenFromCookie(); // Lấy refreshToken từ cookie
    return this.http.put<Response>(`${this.apiRevokeToken}`, { "refreshToken": refreshToken })
  }
 

  removeUserDetailInSession() {
    sessionStorage.removeItem(this.USER_KEY);
  }
  removeUserDetailInLocal() {
    localStorage.removeItem('user');
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


  sendVerificationPasswordCode(email: String): Observable<Response> {
    return this.http.post<Response>(`${this.apisendOTPResetPassword}`, { 'email': email }, { headers: { 'Content-Type': 'application/json' } })
  }

  verifyRegisterCode(code: string, email: string): Observable<Response> {
    return this.http.put<Response>(this.apiVerifyRegisterCode, {
      'code': code,
      'email': email
    }, { headers: { 'Content-Type': 'application/json' } });
  }
  verifyEmailCodeToDo(code: string, email: string): Observable<Response> {
    return this.http.put<Response>(this.apiVerifyCodeForgotPassword, {
      'code': code,
      'email': email
    }, { headers: { 'Content-Type': 'application/json' } });
  }

  checkEmailIsExist(email: string): Observable<Response> {
    let params = new HttpParams()
    .set('email', email.toString())
    const headers = { 'Content-Type': 'application/json' }; // HTTP headers
  
    return this.http.get<Response>(`${this.apiCheckEmailIsExist}`, { params, headers });
  }
  
  updatePassword(email: string, password: string, retype_password: string): Observable<Response> {
    return this.http.put<Response>(`${this.apiUpdatePassword}`, 
      { "email": email, 'password': password, "retype_password": retype_password }, { headers: { 'Content-Type': 'application/json' } });
  }
  sendVerificationEmailCode(email: string, email_new: string): Observable<Response> {

    return this.http.post<Response>(`${this.apiSendEmailCode}`, 
      { 'email': email, 'email_new': email_new }, { headers: { 'Content-Type': 'application/json' } });
  }
  updateEmail(email: string, email_new: string): Observable<Response> {
    return this.http.put<Response>(`${this.apiUpdateEmail}`, 
      { 'email': email, 'email_new': email_new }, { headers: { 'Content-Type': 'application/json' } });

  }

  saveUserDetailToLocalStorage(userResponse: UserDetailResponse) {
    try {
      if (userResponse == null || !userResponse) {
        return;
      }
      const userResponseJSON = JSON.stringify(userResponse);
      localStorage.setItem(this.USER_KEY, userResponseJSON);

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
    return this.http.get(this.apiCallbackAuth, {params, headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'vi',
      }
    })
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

  resetPasswordUser(email: string): Observable<Response> {
    return this.http.put<Response>(`${this.apiResetPassword}`, { 'email': email })
  }

}
