import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginDTO } from '../../dtos/login.dto';
import { TokenService } from '../../services/token.service';
import { UserService } from '../../services/user.service';

import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.interface';
import { UserDetailResponse } from '../../response/user/user.response';
import { environment } from '../../../enviroments/environment';
import { Response } from '../../response/response';
import { ToastrService } from 'ngx-toastr';
import { AppConstants } from '../../common/app.constant';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;
  
  googleURL = AppConstants.GOOGLE_AUTH_URL;
  roles: Role[] = []; // Mảng roles

  userResponse!: UserDetailResponse;

  constructor(
    private router: Router,
    private userService: UserService,
    private tokenService: TokenService,
   
    private formBuilder: FormBuilder,
    private toastr: ToastrService
   
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      user: this.formBuilder.group({
        user_name: new FormControl('', [Validators.required]),
        password: new FormControl('', Validators.required),
        role: new FormControl(1, Validators.required),
        rememberMe: new FormControl(true)
      })
    });
    // Gọi API lấy danh sách roles và lưu vào biến roles
    window.addEventListener('message', (event) => {
      // Kiểm tra nguồn của thông điệp
      if (event.origin === window.location.origin && event.data.type === 'login-success') {
        this.userService.isLogin()
         
          const token = event.data.response.data.token;
          const refresh_token = event.data.response.data.refresh_token;
          const expiredDate = new Date(event.data.response.data.refresh_token_expired);
          // Đặt token và refresh token vào cookie
          this.tokenService.setTokenInCookie(token);
          this.tokenService.setRefreshTokenInCookie(refresh_token);
          this.tokenService.setExpiredRefreshTokenInCookie(expiredDate)
         this.toastr.success("Đăng nhập thành công","",{
          timeOut:2000
         })
        // Tiến hành lấy chi tiết người dùng và chuyển hướng
        this.getUserDetailsAndNavigate(token);
      }
      if (event.origin === window.location.origin && event.data.type === 'login-failed') {
        this.toastr.error(event.data.response,"LỖI",{
          timeOut:2000
         })
      }
    });
   
  }
  getUserDetailsAndNavigate(token: string) {
    this.userService.getUserDetails(token).subscribe({
      next: (userResponse: Response) => {
       
        this.userResponse = {
          ...userResponse.data,
          date_of_birth: new Date(userResponse.data.date_of_birth)
        };
        // let id = this.tokenService.getUserId()
        this.userService.saveUserDetailToLocalStorage(this.userResponse!);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.log(error);
        
        const message = error.error.message;
        this.toastr.error(message, "LỖI", {
          timeOut: 2000
        });
      }
    });
  }
 
  get user_name() { return this.loginForm.get('user.user_name'); }
  get password() { return this.loginForm.get('user.password'); }
  
  loginWithGoogle(): void {
    this.userService.loginWithGoogle().subscribe({
      next: (response: Response) => {
        // Mở cửa sổ pop-up thay vì tab mới
        
        const authUrl = response.data;
        const width = 600;
        const height = 800;
        const left = (window.innerWidth / 2) - (width / 2);
        const top = (window.innerHeight / 2) - (height / 2);
        const windowFeatures = `width=${width}, height=${height}, top=${top}, left=${left}`;
        
        const popupWindow = window.open(authUrl, 'Google Login', windowFeatures);
       

       
      },
      error: (error) => {
        console.error("Failed to initiate Google login", error);
      }
    });
  }
  

  login() {

    const loginDTO: LoginDTO = {
      user_name: this.loginForm.controls['user'].value.user_name,
      password: this.loginForm.controls['user'].value.password,
      roleId: 1
    };
  console.log(loginDTO);
  
    
    this.userService.login(loginDTO).subscribe({
      next: (response:Response) => {

        this.userService.isLogin()
        const token = response.data.token;
        const refresh_token = response.data.refresh_token;
        const expiredDate = new Date(response.data.refresh_token_expired);
        // Đặt token và refresh token vào cookie
        this.tokenService.setTokenInCookie(token);
        this.tokenService.setRefreshTokenInCookie(refresh_token);
        this.tokenService.setExpiredRefreshTokenInCookie(expiredDate)
        
        // Gọi API lấy chi tiết người dùng
        this.getUserDetailsAndNavigate(token);
      },
      error: (error) => {
        const message = error.error.message
        this.toastr.error(message, "LỖI", {
          timeOut: 2000
        });
      }
    });
  }
 
  // getUserDetailsAndNavigate(token: string) {
  //   this.userService.getUserDetails(token).subscribe({
  //     next: (userResponse:Response) => {
  //       this.userResponse = {
  //         ...userResponse.data,
  //         date_of_birth: new Date(userResponse.data.date_of_birth)
  //       };
  
  //       // Lưu trữ chi tiết người dùng dựa trên tùy chọn "remember me"
  //       // if (rememberMe) {
  //       //   // Lưu trữ lâu dài
  //         this.userService.saveUserDetailToLocalStorage(this.userResponse);
  //       // }
  //       // else {
  //         // this.userService.saveUserDetailToSessionStorage(this.userResponse);
  //       // }
  //       // Điều hướng dựa trên vai trò người dùng
  //       // this.navigateBasedOnUserRole(userResponse.data.role_id.name);
  //       this.router.navigate(['/']);
  //     },
  //     error: (error) => {
  //       const message = error.error.message;
  //       this.toastr.error(message, "LỖI", {
  //         timeOut: 2000
  //       });
  //     }
  //   });
  // }
  
  navigateBasedOnUserRole(roleName: string) {
    if (roleName === 'admin') {
      this.router.navigate(['/admin/orders']);
    } else if (roleName === 'user') {
      this.router.navigate(['/']);
    }
  }
}

