import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerifyUserService } from '../../services/verify-user.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-verify-email-successfully',
  templateUrl: './verify-email-successfully.component.html',
  styleUrl: './verify-email-successfully.component.scss'
})
export class VerifyEmailSuccessfullyComponent {
  isSuccess: boolean | null = null;
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private verifyUser: VerifyUserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.verifyEmail(code);
      } else {
        this.isSuccess = false;
        this.message = 'Mã xác thực không hợp lệ.';
      }
    });
  }

  verifyEmail(code: string): void {
   
    // Thay thế URL dưới đây bằng URL thực tế của API xác thực trên BE
    this.verifyUser.verify(code).subscribe({
        next: (response:HttpResponse<any>) => {
        
          if (response.status === 200) {
            
            this.isSuccess = true;
            this.message = 'Email của bạn đã được xác thực thành công!';
          } else {
            this.isSuccess = false;
            this.message = 'Mã xác thực không hợp lệ hoặc đã hết hạn.';
          }
        },
        error: (error:any) => {
          this.isSuccess = false;
          if (error.status === 400) {
            this.message = 'Mã xác thực không hợp lệ hoặc đã hết hạn.';
          } else {
            this.message = 'Đã xảy ra lỗi khi xác thực email. Vui lòng thử lại sau.';
          }
        }
      });
  }
}
