// import { inject, Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
// import { TokenService } from '../services/token.service';
// import { UserService } from '../services/user.service';
// @Injectable({
//   providedIn: 'root'
// })
// export class AdminGuard implements CanActivate {

//   userResponse?:UserResponse
//   constructor(
//     private router: Router,
//     private tokenService:TokenService,
//     private userService:UserService
//   ) {}

//   canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
//     const isTokenExpired = this.tokenService.isTokenExpired();
//     const isUSerIdValid = this.tokenService.getUserId() > 0;
//     this.userResponse = this.userService.getUserDetailFromSessionStorage();
   
    
    
//     let isAdmin = this.userResponse?.role_id.name == 'admin';
//     if(!isTokenExpired && isUSerIdValid && isAdmin ){
//       return true;
//     }else {
        
//       this.router.navigate(['/login']);
//       return false;
//     }
//   } 
// }


// export const AdminGuardFn: CanActivateFn = (
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
// ):boolean => {
    
//     return inject(AdminGuard).canActivate(next,state);
// }