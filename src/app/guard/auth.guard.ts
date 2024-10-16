import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';



@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private tokenService:TokenService,
    private userService:UserService
  ) {}

  canActivate(): boolean {
    const isTokenExpired = this.tokenService.isTokenExpired();
    const isUSerIdValid = this.tokenService.getUserId() > 0;
    if(!isTokenExpired && isUSerIdValid){
      return true;
    }else {
      this.router.navigate(['/login']);
      return false;
    }
  } 
}
