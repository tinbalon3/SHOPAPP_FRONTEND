
import {
    IsString,
    IsNotEmpty,
    IsPhoneNumber, 
    IsDate
} from 'class-validator'
export class RegisterDTO {
    @IsString()
    fullname: string;

    phone_number: string;
    email: string;
    @IsString()
    address: string;
    @IsString()
    @IsNotEmpty()
    password: string;
    @IsString()
    @IsNotEmpty()
    retype_password: string;
    @IsDate()
    date_of_birth: Date;

    facebook_account_id: number;

    google_account_id: number;

    auth_provider:string

    role_id: number;
    constructor(data: any){
        this.fullname = data.fullname;
        this.phone_number=data.phone_numer;
        this.email=data.email;
        this.address=data.address;
        this.password=data.password;
        this.retype_password=data.retype_password;
        this.date_of_birth=data.date_of_birth;
        this.facebook_account_id=data.facebook_account_id || 0;
        this.google_account_id=data.google_account_id || 0;
        this.role_id=data.role_id || 1;
        this.auth_provider = 'LOCAL'
    }
}