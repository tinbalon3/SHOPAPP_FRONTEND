import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { RegisterDTO } from '../dtos/register.dto';
import { LoginDTO } from '../dtos/login.dto';

import { LoginResponse } from '../response/user/login.response';
import { UserDetailResponse} from '../response/user/user.response'
import { TokenService } from './token.service';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { environment } from '../../enviroments/environment';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from './cart.service';
import { Router } from '@angular/router';
import { UserPage } from '../response/user/management/user_page.response';

@Injectable({
  providedIn: 'root'
})
export class UserService {
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

  getAllUser():Observable<UserPage> {
    return this.http.get<UserPage>(this.apiGetAllUser)
  }
  register(registerDTO: RegisterDTO): Observable<any> {
    return this.http.post(this.apiRegister, registerDTO, this.apiConfig);
  }

  logout():Observable<HttpResponse<any>> {

    const refresh_token = this.tokenService.getRefreshTokenFromCookie(); // Lấy token từ localStorage hoặc sessionStorage

    return this.http.post<HttpResponse<any>>(`${this.apiRevokeToken}`, { "refreshToken": refresh_token }, { observe: 'response' }  )

  }
  login(loginDTO: LoginDTO): Observable<any> {

    return this.http.post<LoginResponse>(this.apiLogin, loginDTO, this.apiConfig)
      .pipe(map(user => {

        this.startRefreshTokenTimer(user);
        return user;
      }));
  }

  private refreshTokenTimeout?: number;

  private startRefreshTokenTimer(user: any) {

    const jwtToken = user.token;
    const refreshToken = user.refresh_token
    const expires = this.tokenService.getTokenExpiration(jwtToken);

    if (!expires) {
      console.error('Token expiration time is undefined.');
      return;
    }

    const timeout = expires.getTime() - Date.now() - (60 * 1000);

    this.refreshTokenTimeout = window.setTimeout(() => {

      this.refreshToken(refreshToken).pipe(
        tap(() => { 
          alert("refresh thành công");
          
        })
        ,
        catchError(error => {
          console.error('Token refresh failed', error);
          this.logout();
          return of(null); // Đảm bảo Observable không bị lỗi
        })
      ).subscribe();
    }, timeout);
  }

  refreshToken(refreshToken: string): Observable<string> {
    return this.http.post<any>(`${this.refreshTokenUrl}`, { 'refreshToken': refreshToken })
      .pipe(
        map((authResponse) => {
          console.log(authResponse.token)
          this.tokenService.setTokenInCookie(authResponse.token);
          this.tokenService.setRefreshTokenInCookie(authResponse.refresh_token);
          this.startRefreshTokenTimer(authResponse);
          return authResponse.token;
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
  getUserDetails(token: string): Observable<UserDetailResponse> {

    return this.http.get<UserDetailResponse>(this.apiUserDetails,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        })
      }
    )
  }


  sendVerificationCode(userId: number,token:string): Observable<HttpResponse<any>> {
    return this.http.get<HttpResponse<any>>(`${this.apiSendCode}/${userId}`, {
       observe: 'response'
    });
  }
  
  verify(code:string):Observable<HttpResponse<any>> {
    let params = new HttpParams()
    .set('code', code.toString())
    return this.http.get<HttpResponse<any>>(this.apiVerifyCode, {
      params: params,
      observe: 'response' // Đảm bảo observe là một phần của cùng một đối tượng
    });
  }
  updatePassword(token:string,id:number,password:string,retype_password:string):Observable<HttpResponse<any>> {
    return this.http.put<HttpResponse<any>>(`${this.apiUpdatePassword}/${id}`,{'password':password,"retype_password":retype_password},{
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }),
       observe: 'response'
    });
  }
  sendVerificationEmailCode(userId: number,token:string,email:string): Observable<HttpResponse<any>> {
  
    return this.http.post<HttpResponse<any>>(`${this.apiSendEmailCode}/${userId}`,{'email':email}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }),
       observe: 'response'
    });
  }
  updateEmail(token:string,id:number,email:string):Observable<HttpResponse<any>> {
    return this.http.put<HttpResponse<any>>(`${this.apiUpdateEmail}/${id}`,{'email':email},{
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }),
       observe: 'response'
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

  blockOrEnableUser(id:number,active:number):Observable<any>{
    return this.http.put(`${this.apiBlockUser}/${id}/${active}`,null)
  }
  resetPasswordUser(id:number):Observable<any> {
    return this.http.put(`${this.apiResetPassword}/${id}`,null)
  }
 
}
