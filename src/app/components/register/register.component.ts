import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopValidators } from '../../validators/shop-validators';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { RegisterDTO } from '../../dtos/register.dto';
import { ToastrService } from 'ngx-toastr';
import { Response } from '../../response/response';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  // Khai báo các biến tương ứng với các trường dữ liệu trong form
  countdown: number = 60; // Thời gian đếm ngược ban đầu là 60 giây
  isResendDisabled: boolean = false; // Biến kiểm tra trạng thái của nút Gửi lại
  isDisabled = false;
  verifyCode: string = '';
  user: any;
  otp: string[] = ['', '', '', '', '', ''];
  isSuccessSendEmailCode = false
  isLoading = false;
  registerDTO!: RegisterDTO;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService) {

  }
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      user: this.formBuilder.group({
        phoneNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}'), ShopValidators.notOnlyWhitespace]),
        email: new FormControl('', [Validators.required, ShopValidators.strictEmailValidator, ShopValidators.notOnlyWhitespace]),
        password: new FormControl('', [Validators.required, Validators.minLength(6), ShopValidators.notOnlyWhitespace]),
        retypePassword: new FormControl('', [Validators.required, Validators.minLength(6), ShopValidators.notOnlyWhitespace]),
        fullname: new FormControl('', [Validators.required,Validators.minLength(3), ShopValidators.notOnlyWhitespace,ShopValidators.containsAlphabet,ShopValidators.usernameValidator]),
        address: new FormControl(''),
        dateOfBirth: new FormControl('2003-05-13', ShopValidators.minAge(18)),
        isAccepted: new FormControl(false, [Validators.requiredTrue])
      }, 
      { validator: ShopValidators.checkvaluesmatch('password', 'retypePassword') }) // Move the validator here
    });
  }

  checkPasswordsMatch() {
    if (this.registerForm.controls['user'].value.password !== this.registerForm.controls['user'].value.retypePassword) {
      this.registerForm.get('user.retypePassword')!
        .setErrors({ 'passwordMismatch': true });
    } else {
      this.registerForm.get('user.retypePassword')!.setErrors(null);
    }
  }
  get phoneNumber() { return this.registerForm.get('user.phoneNumber'); }
  get password() { return this.registerForm.get('user.password'); }
  get retypePassword() { return this.registerForm.get('user.retypePassword'); }
  get fullname() { return this.registerForm.get('user.fullname'); }
  get address() { return this.registerForm.get('user.address'); }
  get dateOfBirth() { return this.registerForm.get('user.dateOfBirth'); }
  get email() { return this.registerForm.get('user.email'); }
  get isAccepted() { return this.registerForm.get('user.isAccepted'); }

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

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

     this.registerDTO = {
      "fullname": this.registerForm.controls['user'].value.fullname,
      "phone_number": this.registerForm.controls['user'].value.phoneNumber,
      "email": this.registerForm.controls['user'].value.email,
      "address": this.registerForm.controls['user'].value.address,
      "password": this.registerForm.controls['user'].value.password,
      "retype_password": this.registerForm.controls['user'].value.retypePassword,
      "date_of_birth": this.registerForm.controls['user'].value.dateOfBirth,
      // "facebook_account_id": 0,
      "google_account_id": 0,
      "auth_provider": 'LOCAL',
      "role_id": 1
    }
   
    this.isLoading=true
    this.registerRequest(this.registerDTO);
   

  }
  registerRequest(register:RegisterDTO){
    if (this.isResendDisabled) {
      this.isLoading = false
      return; 
     } // Nếu đang đếm ngược thì không làm gì
    this.isResendDisabled = true;        // Vô hiệu hóa nút gửi lại
    this.startCountdown();      
    this.userService.register(register).subscribe({
      next: (response: Response) => {
        
        this.isSuccessSendEmailCode = true
        this.isLoading = false
        const message = 'Mã xác thực đã được gửi qua email của bạn!';
        this.toastr.success(message, "ĐÃ GỬI", {
          timeOut: 2000
        });
      },

      error: (error: any) => {
       
        const message = error.error.message;
        this.toastr.error(message, "LỖI", {
          timeOut: 2000
        });
        this.isResendDisabled = false
        this.isLoading = false
      }
    })
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

  isVerifyEnabled(): boolean {
    return this.otp.every(num => num != '');
  }

  verifyEmailCode() {
    this.isLoading = true
    const otp = this.otp.join('');
    this.userService.verify(otp,this.registerForm.controls['user'].value.email).subscribe({
      next: (response: Response) => {
       
        
        if (response.status == "OK") {
          this.isLoading = false
          this.toastr.success("Đăng kí thành công", "THÀNH CÔNG", {
            timeOut: 2000,

          });
          this.router.navigate(['/login'])
        }
        else {

          this.toastr.error("Xác thực không thành công", "THẤT BẠI", {
            timeOut: 2000,

          });
          this.isLoading = false
          this.router.navigate(['/login'])
        }
      },
      error: (err: any) => {
        this.isLoading = false
        this.toastr.error("Nhập sai mã xác thực", "THẤT BẠI", {
          timeOut: 2000,

        })
      }
    })


  }
}



