import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Response } from '../../response/response';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.scss'
})
export class ForgotpasswordComponent implements OnInit {
  email = ""
  isResendDisabled: boolean = false;
  countdown: number = 60;
  ngOnInit(): void {

  }
  constructor(private userService: UserService,
    private toastr: ToastrService
  ) { 
    this.email = ''
  }
  resetPasswordUser(email: string) {
    if (this.isResendDisabled) {
      return; 
     } // Nếu đang đếm ngược thì không làm gì
    this.isResendDisabled = true;        // Vô hiệu hóa nút gửi lại
    this.startCountdown();      
    this.userService.resetPasswordUser(email).subscribe({
      next: (response: Response) => {
       
        let message = response.message
        this.toastr.success(message, "THÀNH CÔNG", {
          timeOut: 2000
        })
      },
      error: (err: any) => {
        this.isResendDisabled = false; 
        // Truy cập thông điệp lỗi từ backend
        const errorMessage = err.error.message || 'Có lỗi xảy ra';
        this.toastr.error(errorMessage, "THẤT BẠI", {
          timeOut: 4000
        });

      }
    })
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
