import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Response } from '../../response/response';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.scss'
})
export class ForgotpasswordComponent implements OnInit {
  email = ""
  isSuccessSendEmailCode = false
  isResendDisabled: boolean = false;
  countdown: number = 60;
  isLoading = false;
  otp: string[] = ['', '', '', '', '', ''];
  ngOnInit(): void {

  }
  constructor(private userService: UserService, private toastr: ToastrService, private router: Router) { this.email = '' }

  isVerifyEnabled(): boolean {
    return this.otp.every(num => num != '');
  }

  onInput(index: number): void {
    if (this.otp[index] && index < this.otp.length - 1) {
      const nextInput = document.querySelector(`input:nth-of-type(${index + 1})`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        nextInput.value = ''
      }
    }
  }

  verifyCode() {
    this.isLoading = true
    const otp = this.otp.join('');
    this.userService.verifyEmailCodeToDo(otp, this.email).subscribe({
      next: (response: Response) => {
        if (response.status == 200) {
          this.isLoading = false
          this.toastr.success("Xác thực hành công", "THÀNH CÔNG", {
            timeOut: 2000,
          }); 
          this.resetPasswordUser(this.email)
        }
        else {
          this.toastr.error("Mã OTP không chính xác, vui lòng thử lại", "THẤT BẠI", {
            timeOut: 2000,
          });
          this.isLoading = false
        
        }
      },
      error: (err: any) => {
        this.isLoading = false
        this.toastr.error("Có lỗi xảy ra với hệ thống, vui lòng thử lại", "THẤT BẠI", {
          timeOut: 2000,
        })
      }
    })
  }
  resetPasswordUser(email:string){
  this.userService.resetPasswordUser(email).subscribe({
      next: (response: Response) => {

        let message = "Mật khẩu đã được cập nhật. Quay lại trang đăng nhập để tiếp tục."
        this.toastr.success(message, "THÀNH CÔNG", {
          timeOut: 2000
        })
        this.router.navigate(['/login'])
      },
      error: (err: any) => {
        this.isResendDisabled = false;
        // Truy cập thông điệp lỗi từ backend
        const errorMessage = err.error.message || 'Có lỗi xảy ra';
        this.toastr.error(errorMessage, "THẤT BẠI", {
          timeOut: 4000
        });
        this.router.navigate(['/login'])

      }
    })
}

checkIsMailIsExist(email:string) {
  this.userService.checkEmailIsExist(email).subscribe({
    next: (response: Response) => {
      if (response.status == 200) {
        this.sendOTPCodeToEmail(email);
      }
      else{
        this.toastr.error(response.message, "THẤT BẠI", {
          timeOut: 2000,
      })
      }
    }
  })
}
  sendOTPCodeToEmail(email: string) {
    if (this.isResendDisabled) {
      return;
    } // Nếu đang đếm ngược thì không làm gì
    this.isResendDisabled = true;   
    this.isLoading = true     
    this.startCountdown();
    this.userService.sendVerificationPasswordCode(email).subscribe({
      next: (response: Response) => {
        this.isLoading = false
        if (response.status == 200) { // Kiểm tra response không null
         this.isSuccessSendEmailCode = true
          const message = 'Hãy kiểm tra email để lấy mã xác nhận!';
          this.toastr.success(message, "Gửi thành công", {
            timeOut: 2000
          });
        } else {

          const message = 'Đã có lỗi xảy ra.';
          this.toastr.error(message, "Lỗi", {
            timeOut: 2000
          });
        }
      },
      error: (error: any) => {
        this.isLoading = false

     
        if (error.status == 400) { // Kiểm tra error không null
          const message = 'Xảy ra lỗi khi gửi mã xác thực.';
          this.toastr.error(message, "Gửi không thành công", {
            timeOut: 2000
          });
        } else {
          // Xử lý lỗi khác
          const message = 'Có lỗi không xác định xảy ra.';
          this.toastr.error(message, "Lỗi", {
            timeOut: 2000
          });
        }
      }
    });
    
  }
  startCountdown() {
    const countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--; // Giảm thời gian đếm ngược
      } else {
        clearInterval(countdownInterval); // Dừng đếm ngược khi thời gian còn lại là 0
        this.isResendDisabled = false;     // Kích hoạt lại nút gửi
        this.countdown = 60;               // Đặt lại thời gian đếm ngược
      }
    }, 1000); // Đếm ngược mỗi giây
  }
}
