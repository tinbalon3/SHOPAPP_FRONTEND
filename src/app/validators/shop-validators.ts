import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export class ShopValidators {
    //whitespace validation
    static notOnlyWhitespace(control:FormControl): ValidationErrors| null {
        if((control.value != null) && (control.value.trim().length === 0)){

            //invalid, return error object
            return {'notOnlyWhitespace':true};
        }
        else {
            //vaid, return null
            return null;
        }
       
    }
    static strictEmailValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value;
    
      if (!value) {
        return null; // Không kiểm tra nếu trường trống
      }
    
      // Regex kiểm tra email có định dạng username@gmail.com
      const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    
      // Kiểm tra xem giá trị có khớp với regex hay không
      if (!strictEmailRegex.test(value)) {
        return { invalidEmail: true }; // Trả về lỗi nếu không hợp lệ
      }
    
      return null; // Email hợp lệ
    }
    
    
  

    static usernameValidator(control: AbstractControl): ValidationErrors | null {
      const value = control.value as string;
    
      if (!value) {
        return null; // Không kiểm tra nếu giá trị trống
      }
    
      // Kiểm tra nếu có ký tự không hợp lệ (chỉ cho phép chữ cái, số, khoảng trắng và dấu chấm)
      const invalidCharacters = /[^a-zA-Z0-9 .]/.test(value);
      if (invalidCharacters) {
        return { invalidCharacters: true };
      }
    
      // Kiểm tra nếu có nhiều dấu chấm liên tiếp
      const multipleDots = /\.\./.test(value);
      if (multipleDots) {
        return { multipleDots: true };
      }
    
      // Kiểm tra ký tự bắt đầu hoặc kết thúc không hợp lệ (trừ dấu chấm)
      const invalidStartOrEnd = /^[^a-zA-Z0-9]|[^a-zA-Z0-9]$/.test(value) && !value.startsWith('.') && !value.endsWith('.');
      if (invalidStartOrEnd) {
        return { invalidStartOrEnd: true };
      }
    
      return null; // Nếu tất cả điều kiện đều thỏa mãn
    }
    


    static containsAlphabet(control: AbstractControl): ValidationErrors | null {
      const value = control.value || '';
      const alphabetRegex = /[a-zA-Z]/; // Regex để kiểm tra chữ cái
      if (!alphabetRegex.test(value)) {
        return { containsAlphabet: true }; // Lỗi nếu không chứa chữ cái
      }
      return null; // Hợp lệ
    }


    static checkvaluesmatch(val1: any, val2: any): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
  
          let v1 = control.get(val1);
          let v2 = control.get(val2);
  
          if (v1 && v2 && v1?.value != v2?.value) {
              return {
                  valuematcherror: true
              }
          }
  
          return null;
      }
  }
    
     
  static minAge(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const birthDate = new Date(control.value);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= minAge ? null : { minAge: true };
    };
  }


}
