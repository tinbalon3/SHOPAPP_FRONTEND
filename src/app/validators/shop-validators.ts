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
