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
   
    const isLogin = this.userService.checkLogin()
    
    if (isLogin) {
      
      return of(true);
    }
    this.router.navigate(['/login'])
    return of(false);
      
    }
   
   
  }



