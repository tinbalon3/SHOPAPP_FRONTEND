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

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {
  private apiRegister = environment.apiBaseUrl + '/users/register';
  private apiGetAllUser = environment.apiBaseUrl + '/users';
  private apiLogin = environment.apiBaseUrl + '/users/login';
  private apiLoginGoogle = environment.apiBaseUrl + '/users/googleLogin';
  private apiUserDetails = environment.apiBaseUrl + '/users/details'
  private refreshTokenUrl = environment.apiBaseUrl + '/token/refreshToken';
  private apiRevokeToken = environment.apiBaseUrl + "/token/revoke-token"
  private apiSendCode = environment.apiBaseUrl + "/users/send-verification-code"
  private apiSendEmailCode = environment.apiBaseUrl + "/users/send-verification-email-code"
  private apiVerifyCode = environment.apiBaseUrl + "/users/verify";
  private apiUpdatePassword = environment.apiBaseUrl + "/users/update_password"
  private apiUpdateEmail = environment.apiBaseUrl + "/users/update_email"
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
    private router: Router
   
  ) { }
  ngOnInit(): void {
    
  }
  loginWithGoogle():Observable<Response> {
    return this.http.get<Response>(this.apiLoginGoogle)
  }
  isLogin(){
    return localStorage.setItem("isLogin",true+'');
  }
  checkLogin(){
    return localStorage.getItem("isLogin");
  }
  getAllUser(): Observable<Response> {
    return this.http.get<Response>(this.apiGetAllUser)
  }
  register(registerDTO: RegisterDTO): Observable<Response> {
    return this.http.post<Response>(this.apiRegister, registerDTO, this.apiConfig);
  }

  logout(): Observable<Response> {
    const refreshToken = this.tokenService.getRefreshTokenFromCookie(); // Lấy refreshToken từ cookie
    return this.http.post<Response>(`${this.apiRevokeToken}`, { "refreshToken": refreshToken })
  }
  
  login(loginDTO: LoginDTO): Observable<Response> {
    return this.http.post<Response>(this.apiLogin, loginDTO, this.apiConfig);
  }

  handleLogout() {
    debugger
    this.cartService.resetCart();
    this.cookieService.delete('token');
    this.cookieService.delete('refresh_token');
    this.cookieService.delete('refresh_token_expire');
    this.removeUserDetailInLocal()
    localStorage.removeItem('isLogin')
    this.router.navigate(['/login']);
  }
  refreshToken(refreshToken: string): Observable<Response> {
    return this.http.post<Response>(`${this.refreshTokenUrl}`, { 'refreshToken': refreshToken })
      .pipe(
        map((authResponse) => {

          this.tokenService.setTokenInCookie(authResponse.data.token);
          this.tokenService.setRefreshTokenInCookie(authResponse.data.refresh_token);
          this.tokenService.setExpiredRefreshTokenInCookie(authResponse.data.refresh_token_expired);
          return authResponse;
        })
      );
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


  sendVerificationCode(userId: number): Observable<Response> {
    
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
    return this.http.put<Response>(`${this.apiUpdatePassword}/${id}`, { 'password': password, "retype_password": retype_password });
  }
  sendVerificationEmailCode(userId: number, email: string): Observable<Response> {

    return this.http.post<Response>(`${this.apiSendEmailCode}/${userId}`,{'email':email});
  }
  updateEmail(id: number, email: string): Observable<Response> {
    return this.http.put<Response>(`${this.apiUpdateEmail}/${id}`, { 'email': email });

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
