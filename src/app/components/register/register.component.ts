import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopValidators } from '../../validators/shop-validators';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { RegisterDTO } from '../../dtos/register.dto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  // Khai báo các biến tương ứng với các trường dữ liệu trong form

  isDisabled = false;
  verifyCode: string = '';
  user: any;
  otp: string[] = ['', '', '', '', '', ''];
  isSuccessSendEmailCode = false
  isLoading = false;
  constructor(private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService) {

  }
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      user: this.formBuilder.group({
        phoneNumber: new FormControl('0999999998', [Validators.required, Validators.pattern('[0-9]{10}'), ShopValidators.notOnlyWhitespace]),
        email: new FormControl('alosinl048@gmail.com', [Validators.required, Validators.email, ShopValidators.notOnlyWhitespace]),
        password: new FormControl('123456', [Validators.required, Validators.minLength(3), ShopValidators.notOnlyWhitespace]),
        retypePassword: new FormControl('123456', [Validators.required, Validators.minLength(3), ShopValidators.notOnlyWhitespace]),
        fullname: new FormControl('testcase1', [Validators.required, ShopValidators.notOnlyWhitespace]),
        address: new FormControl('testcase1', Validators.required),
        dateOfBirth: new FormControl('2003-05-13', ShopValidators.minAge(18)),
        isAccepted: new FormControl(true, Validators.required)
      }, { validator: ShopValidators.checkvaluesmatch('password', 'retypePassword') }) // Move the validator here
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

  register() {

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const registerDTO: RegisterDTO = {
      "fullname": this.registerForm.controls['user'].value.fullname,
      "phone_number": this.registerForm.controls['user'].value.phoneNumber,
      "email": this.registerForm.controls['user'].value.email,
      "address": this.registerForm.controls['user'].value.address,
      "password": this.registerForm.controls['user'].value.password,
      "retype_password": this.registerForm.controls['user'].value.retypePassword,
      "date_of_birth": this.registerForm.controls['user'].value.dateOfBirth,
      "facebook_account_id": 0,
      "google_account_id": 0,
      "role_id": 1
    }
   
    this.isLoading=true
    this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        this.isSuccessSendEmailCode = true
        this.isLoading = false
        const message = 'Mã xác thực đã được gửi qua email của bạn!';
        this.toastr.success(message, "ĐÃ GỬI", {
          timeOut: 2000
        });



      },

      error: (error: any) => {
        console.log(`Cannot register, error: ${error.message}`);
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
    this.userService.verify(otp).subscribe({
      next: (response: HttpResponse<any>) => {
        if (response.status == 200) {
         
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



