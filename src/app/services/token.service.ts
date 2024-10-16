
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { map, Observable, share } from 'rxjs';
import { environment } from '../../enviroments/environment';


@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY ='token';
  private expiredRTUrl = environment.apiBaseUrl +'/refreshToken/refreshExpirationDate';
  private jwtHelperService = new JwtHelperService();
  constructor(private cookieService: CookieService,private http: HttpClient){}
  private apiConfig = {
    headers: this.createHeaders()
  }
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type':'application/json',
      'Accept-Language':'vi'
     
    })
  }
  getToken():string | ''{
    
    let tokenLocalStorage = localStorage.getItem(this.TOKEN_KEY);
    let tokenSessionStorage = sessionStorage.getItem(this.TOKEN_KEY);
   
      if(tokenLocalStorage != null)
          return tokenLocalStorage;
      else if(tokenSessionStorage != null)
        return tokenSessionStorage;
      
      return '';
   
  }

  getTokenFromCookie(){
    const token = this.cookieService.get(this.TOKEN_KEY);
   
    if(token){
      return token;
    }
    return null;
  }
  getRefreshTokenFromCookie(){
    const token = this.cookieService.get('refresh_token');
    if(token){
      return token;
    }
    return null;
  }
  getTokenExpiration(token: string): Date | null {
    if (!token) {
      return null;
    }
    
    // Lấy thời gian hết hạn của token
    const expirationDate = this.jwtHelperService.getTokenExpirationDate(token);
   

    return expirationDate;
  }
  removeTokenInCookie(){
    this.cookieService.delete('token');

  }
  setTokenInCookie(token: string): void {
    const expireDate = this.getTokenExpiration(token);
    if(expireDate != null){
      
      this.cookieService.set('token', token, expireDate, '/', '', false, 'Strict');
    }
  }

  setRefreshTokenInCookie(refresh_token: string): void {
    // Sử dụng forkJoin để thực hiện đồng thời lệnh gọi getExpiredRefreshToken và set cookie sau khi hoàn thành
    this.getExpiredRefreshToken(refresh_token).subscribe({
      next: (data) => {
        const expireDate = new Date(data);
        this.cookieService.set('refresh_token', refresh_token, expireDate, '/', '', false, 'Strict');
      },
      error: (error) => {
        console.error('Error setting refresh token:', error);
      }
    });
  }

  getExpiredRefreshToken(refresh_token:string): Observable<any> {

    return this.http.get(`${this.expiredRTUrl}/${refresh_token}`,this.apiConfig)
  }
  getUserId(): number {
    
    const token = this.getTokenFromCookie();
    if (!token) {
      return 0; // Or handle token expiry as needed
    }
  
    const userObject = this.jwtHelperService.decodeToken(token);
    return 'userId' in userObject ? parseInt(userObject['userId']) : 0;
  }
  setTokenInSessionStorage(token:string){
    sessionStorage.setItem(this.TOKEN_KEY,token);
  }
  setTokenInLocalStorage(token: string):void {
    localStorage.setItem(this.TOKEN_KEY,token);
  }
  removeTokenLocalStorage(){
    localStorage.removeItem(this.TOKEN_KEY);
  }
  removeTokenSessionStorage(){
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
  isTokenExpired(token?: string): boolean {
    // Sử dụng token được truyền vào hoặc lấy từ cookie nếu không có
    const actualToken = token ?? this.getTokenFromCookie();

    // Trả về true nếu token trống
    if (!actualToken) {
        return true;
    }

    try {
        // Kiểm tra token có hợp lệ hay không
        return this.jwtHelperService.isTokenExpired(actualToken);
    } catch (error) {
        // Trả về true nếu token không hợp lệ
        console.error('Invalid token:', error);
        return true;
    }
}


}
