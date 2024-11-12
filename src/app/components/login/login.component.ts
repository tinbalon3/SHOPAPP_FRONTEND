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
import { AppConstants } from '../common/app.constant';
import { Response } from '../../response/response';
import { ToastrService } from 'ngx-toastr';

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
    private roleService: RoleService,
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
  
    this.roleService.getRoles().subscribe({
      next: (roles: Response) => { // Sử dụng kiểu Role[]
      
        this.roles = roles.data;
        this.loginForm.controls['user'].value.role = roles.data.length > 0 ? roles.data[0] : undefined;
      },
      error: (error: any) => {
     
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
    // Điều hướng đến URL OAuth của server
    
    window.location.href = this.googleURL;
  }

  login() {

    const loginDTO: LoginDTO = {
      user_name: this.loginForm.controls['user'].value.user_name,
      password: this.loginForm.controls['user'].value.password,
      role_id: this.loginForm.controls['user'].value.role ?? 1,
      remember_me: !!this.loginForm.controls['user'].value.rememberMe
    };
  
   
    
    this.userService.login(loginDTO).subscribe({
      next: (response:Response) => {
    
        const token = response.data.token;
        const refresh_token = response.data.refresh_token;
  
        // Đặt token và refresh token vào cookie
        this.tokenService.setTokenInCookie(token);
        this.tokenService.setRefreshTokenInCookie(refresh_token);
  
        // Gọi API lấy chi tiết người dùng
        this.getUserDetailsAndNavigate(token,  loginDTO.remember_me);
      },
      error: (error) => {
        
        const message = error.error.message;
        this.toastr.error(message, "LỖI", {
          timeOut: 2000
        });
      }
    });
  }
  
  getUserDetailsAndNavigate(token: string, rememberMe: boolean) {
    this.userService.getUserDetails(token).subscribe({
      next: (userResponse:Response) => {
        this.userResponse = {
          ...userResponse.data,
          date_of_birth: new Date(userResponse.data.date_of_birth)
        };
  
        // Lưu trữ chi tiết người dùng dựa trên tùy chọn "remember me"
        if (rememberMe) {
          // Lưu trữ lâu dài
          this.userService.saveUserDetailToLocalStorage(this.userResponse);
        }
        else {
          this.userService.saveUserDetailToSessionStorage(this.userResponse);
        }
        // Điều hướng dựa trên vai trò người dùng
        this.navigateBasedOnUserRole(userResponse.data.role_id.name);
      },
      error: (error) => {
        const message = error.error.message;
        this.toastr.error(message, "LỖI", {
          timeOut: 2000
        });
      }
    });
  }
  
  navigateBasedOnUserRole(roleName: string) {
    if (roleName === 'admin') {
      this.router.navigate(['/admin/orders']);
    } else if (roleName === 'user') {
      this.router.navigate(['/']);
    }
  }
}

