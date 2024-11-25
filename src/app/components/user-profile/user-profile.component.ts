import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopValidators } from '../../validators/shop-validators';
import { UserService } from '../../services/user.service';
import { UpdateUserDTO } from '../../dtos/update-user.dto';
import { TokenService } from '../../services/token.service';

import { ToastrService } from 'ngx-toastr';
import { UserDetailResponse } from '../../response/user/user.response';
import { Response } from '../../response/response';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  userForm!: FormGroup;
  // Khai báo các biến tương ứng với các trường dữ liệu trong form
  token: string = '';
  isDisabled = false;
  userResponse!: UserDetailResponse;
  option_menu = 1
  password_new = ''
  password_new_check = ''
  email_new = ''
  disabled = false;
  isSuccessSendCode = false;
  isSuccessSendEmailCode = false;
  isSuccessVerifyCode = false
  isOpenResetPassword = false
  isOpenChangeEmail = false;
  isChangeEmail = false;
  editedUserResponse! :UserDetailResponse
  isEditingField: string | null = null; // Dùng để xác định trường nào đang được chỉnh sửa
  errorMessage: string | null = null;
  otp: string[] = ['', '', '', '', '', ''];
  isLoading = false;

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private toastr: ToastrService) {

  }
  ngOnInit(): void {
    this.token = this.tokenService.getTokenFromCookie()!;
    this.userService.getUserDetails(this.token).subscribe({
      next: (response:Response) => {
      
        
        this.userResponse = {
          ...response.data,
          date_of_birth: new Date(response.data.date_of_birth)
        }
        this.editedUserResponse = { ...this.userResponse ,date_of_birth: new Date(response.data.date_of_birth)};
       
        
      },
      error: (e) => {
       
        
        this.userService.handleLogout()
      }
    })

  }

 

  // Danh sách các trường có thể chỉnh sửa
  fields = [
    { name: 'fullname', label: 'Tên', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone_number', label: 'Số điện thoại', type: 'text' },
    { name: 'address', label: 'Địa chỉ', type: 'text' },
    { name: 'date_of_birth', label: 'Ngày sinh', type: 'date' }
  ];
  calculateAge(birthdate: Date): number {

    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  startEditing(field: string) {

    if (field == 'email') {
      this.isChangeEmail = !this.isChangeEmail;
    }
    else {
      this.isEditingField = field;
      this.errorMessage = null; // Xóa thông báo lỗi khi bắt đầu chỉnh sửa
    }
  }


  finishEditing() {

    // Kiểm tra nếu trường đang chỉnh sửa là ngày sinh và tính tuổi
    if (this.isEditingField === 'date_of_birth') {
      const age = this.calculateAge(this.editedUserResponse.date_of_birth);
      if (age < 18) {
        this.toastr.error("Phải lớn hơn hoặc bằng 18 tuổi", "LỖI NGÀY SINH", {
          timeOut: 2000,
        })
        this.editedUserResponse.date_of_birth = this.userResponse.date_of_birth;
        return; // Không cho phép lưu nếu người dùng dưới 18 tuổi
      }

    }
    if (this.isEditingField === "address") {
      if (this.editedUserResponse.address.length < 5) {
        this.toastr.error("Địa chỉ phải dài hơn 5 ký tự", "KHÔNG PHÙ HỢP", {
          timeOut: 2000,
        });
        // Khôi phục lại địa chỉ từ dữ liệu gốc
        this.editedUserResponse.address = this.userResponse.address;
        return;
      }
    }
    
    if (this.isEditingField === "fullname") {
      if (this.editedUserResponse.fullname.length < 5) {
        this.toastr.error("Tên người dùng phải dài hơn 5 ký tự", "KHÔNG PHÙ HỢP", {
          timeOut: 2000,
        });
        // Khôi phục lại họ tên từ dữ liệu gốc
        this.editedUserResponse.fullname = this.userResponse.fullname;
        return;
      }
    }
    if (this.isEditingField === "phone_number") {
      if (!this.validatePhoneNumber(this.editedUserResponse.phone_number)) {
       
        // Khôi phục lại họ tên từ dữ liệu gốc
        this.editedUserResponse.phone_number = this.userResponse.phone_number;
        return;
      }
    }
    
    this.userResponse = { ...this.editedUserResponse };
    this.isEditingField = null;
  }


  // Hủy chỉnh sửa
  cancelEditing() {
    this.editedUserResponse = { ...this.userResponse };
    this.isEditingField = null;
  }

  validatePhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      this.toastr.error("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại đúng định dạng (10 chữ số, bắt đầu bằng 0).", "KHÔNG PHÙ HỢP", {
        timeOut: 2000,
      });
      return false;
    }
    return true;
  }
  

  changeOption(option: number) {
    this.option_menu = option
  }
 

  formatDate_2(dateObject: any): string {
    let date = new Date(dateObject)
    const day = String(date.getDate());
    const month = String(date.getMonth() + 1);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  updatePassword() {
    if (this.password_new !== this.password_new_check) {
      this.toastr.error("Mật khẩu chưa khớp", "LỖI MẬT KHẨU", {
        timeOut: 2000,
      })

    } else {
      this.isLoading = true
      let token = this.tokenService.getTokenFromCookie()!;
      let userId = this.tokenService.getUserId()!;
      this.userService.updatePassword(token, userId, this.password_new, this.password_new_check).subscribe({
        next: (response: Response) => {
          if (response.status == "OK") {
            this.isLoading = false

            this.toastr.success("Thay đổi mật khẩu thành công", "THÀNH CÔNG", {
              timeOut: 2000,
            })
            window.location.reload();

          }
          else {
            this.isLoading = false

            this.toastr.error("Thay đổi mật khẩu không thành công", "THẤT BẠI", {
              timeOut: 2000,
            })
          }
        }
      })

    }
  }


  saveInfo() {
    const UpdateUserDTO: UpdateUserDTO = {
      fullname: this.userResponse.fullname,
      address: this.userResponse.address,
      date_of_birth: this.userResponse.date_of_birth,
      phone_number: this.userResponse.phone_number
    }
    
    this.isLoading = true

    this.userService.updateUser(this.token, UpdateUserDTO).subscribe({
      next: (response:UpdateUserDTO) => {
        this.isLoading = false

        this.toastr.success("Cập nhật thành công", "CẬP NHẬT HỒ SƠ", {
          timeOut: 2000,
        })
      },
      error: (error: any) => {
        this.isLoading = false
        alert(`Cannot update user, error: ${error.error}`)
      }
    })

  }

  formatDate(date: any) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
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


  sendVerifyCode(type: string) {
    this.isLoading = true

    const userId = this.tokenService.getUserId();
    console.log(userId);
    
  
      if (type == 'password') {
        console.log(123);
        
        this.userService.sendVerificationCode(userId).subscribe({
          next: (response: Response) => {
            this.isLoading = false
            console.log(response);
            
            if (response.status == "OK") { // Kiểm tra response không null
              this.isSuccessVerifyCode = true
              this.isSuccessSendCode = true;
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

            this.isSuccessSendCode = false;
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
      if (type == 'email') {
        
        this.userService.sendVerificationEmailCode(userId, this.email_new).subscribe({
          next: (response: Response) => {
            this.isLoading = false
            console.log(response);
            
            if (response.status == "OK") { // Kiểm tra response không null
              this.isChangeEmail = false;
              this.isSuccessSendEmailCode = true;
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
            this.isSuccessSendEmailCode = false;
            if (error.status == 400) { // Kiểm tra error không null
              const message = 'Xảy ra lỗi khi gửi mã xác thực.';
              console.log(error.message)
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

    
  }
  verifyEmailCode() {
    this.isLoading = true
    const otp = this.otp.join('');
    this.userService.verify(otp,this.userResponse.email).subscribe({
      next: (response: Response) => {
        this.isLoading = false
        if (response.status == "OK") {
          let userId = this.tokenService.getUserId()!;
          this.userService.updateEmail(userId, this.email_new).subscribe({
            next: (response: Response) => {
              if (response.status == "OK") {
                this.isSuccessSendEmailCode = false;
                this.userResponse.email = this.email_new;
                this.toastr.success("Thay đổi email thành công", "Xác thực thành công", {
                  timeOut: 2000
                });
              }
            }
          })
        }
      }
    })
  }
  verifyCode() {
    this.isLoading = true
    const otp = this.otp.join('');
    this.userService.verify(otp,this.userResponse.email).subscribe({
      next: (response: Response) => {
        this.isLoading = false
        if (response.status == "OK") {
          this.isSuccessSendCode = false;
          this.isOpenResetPassword = true

          const message = 'Tiến hành thay đổi mật khẩu!';
          this.toastr.success(message, "Xác thực thành công", {
            timeOut: 2000
          });
        }
      }
    })
  }

}

