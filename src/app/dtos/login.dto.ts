

export class LoginDTO {
    phone_number: string;
    password: string;
    role_id: number
    remember_me: boolean;
    constructor(data: any){
        this.phone_number=data.phone_numer;
        this.password=data.password;
        this.role_id=data.role_id;
        this.remember_me = data.remember_me
    }
}