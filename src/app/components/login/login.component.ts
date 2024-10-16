import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginDTO } from '../../dtos/login.dto';
import { TokenService } from '../../services/token.service';
import { UserService } from '../../services/user.service';

import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.interface';
import { UserDetailResponse } from '../../response/user/user.response';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;


  roles: Role[] = []; // Mảng roles

  userResponse!: UserDetailResponse;

  constructor(
    private router: Router,
    private userService: UserService,
    private tokenService: TokenService,
    private roleService: RoleService,
    private formBuilder: FormBuilder
   
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      user: this.formBuilder.group({
        phoneNumber: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
        role: new FormControl(1, Validators.required),
        rememberMe: new FormControl(true)
      })
    });
    // Gọi API lấy danh sách roles và lưu vào biến roles
  
    this.roleService.getRoles().subscribe({
      next: (roles: Role[]) => { // Sử dụng kiểu Role[]
      
        this.roles = roles;
        this.loginForm.controls['user'].value.role = roles.length > 0 ? roles[0] : undefined;
      },
      error: (error: any) => {
     
        console.error('Error getting roles:', error.message);
      }
    });
  }
  get phoneNumber() { return this.loginForm.get('user.phoneNumber'); }
  get password() { return this.loginForm.get('user.password'); }
  


  login() {

    const loginDTO: LoginDTO = {
      phone_number: this.loginForm.controls['user'].value.phoneNumber,
      password: this.loginForm.controls['user'].value.password,
      role_id: this.loginForm.controls['user'].value.role ?? 1,
      remember_me: !!this.loginForm.controls['user'].value.rememberMe
    };
  
    this.userService.login(loginDTO).subscribe({
      next: (response) => {
    
        const token = response.token;
        const refresh_token = response.refresh_token;
  
        // Đặt token và refresh token vào cookie
        this.tokenService.setTokenInCookie(token);
        this.tokenService.setRefreshTokenInCookie(refresh_token);
  
        // Gọi API lấy chi tiết người dùng
        this.getUserDetailsAndNavigate(token,  loginDTO.remember_me);
      },
      error: (error) => {
        alert(error.message);
      }
    });
  }
  
  getUserDetailsAndNavigate(token: string, rememberMe: boolean) {
    this.userService.getUserDetails(token).subscribe({
      next: (userResponse) => {
        this.userResponse = {
          ...userResponse,
          date_of_birth: new Date(userResponse.date_of_birth)
        };
  
        // Lưu trữ chi tiết người dùng dựa trên tùy chọn "remember me"
        if (rememberMe) {
          // Lưu trữ lâu dài
          this.userService.saveUserDetailToLocalStorage(this.userResponse);
        }
  
        // Điều hướng dựa trên vai trò người dùng
        this.navigateBasedOnUserRole(userResponse.role_id.name);
      },
      error: (error) => {
        console.error('Error getting user details:', error);
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

