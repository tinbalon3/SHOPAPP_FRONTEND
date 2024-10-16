import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserDetailResponse } from '../../response/user/user.response';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { CartService } from '../../services/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{

  userReponse?:UserDetailResponse | null;
  userId!:number;
  constructor(private userService:UserService,
    private router:Router,
    private tokenService:TokenService,
    private cartService: CartService,
    private cookieService: CookieService){}
  ngOnInit(): void {
  
    this.userId = this.tokenService.getUserId();
    this.userReponse = this.userService.getUserDetailFromSessionStorage();
  }
  logout(){
  
   this.userService.logout().subscribe({
   next:(response:HttpResponse<any>) => {
    if(response.status === 200){
      
      this.cookieService.delete('token', '/', 'localhost', true, 'Strict');
      this.cookieService.delete('refresh_token', '/', 'localhost', true, 'Strict');
      this.userService.removeUserDetail();
      this.cartService.resetCart();
      this.userService.stopRefreshTokenTimer();
      this.router.navigate(['/login'])
    }
    
   },
   error:(err:any) => {
    console.error("Lỗi trong quá trình đăng xuất:", err.message);
   }
 
   
  });
  }
}
