import { Role } from "../../models/role.interface";

export interface UserDetailResponse {
    fullname:string;
    phone_number:string;
    email:string
    address:string;
    date_of_birth:Date;
    facebook_account_id:string;
    google_account_id:string;
    active:number;
    role_id:Role;
    [key: string]: any; // Chỉ mục này cho phép sử dụng bất kỳ chuỗi nào để truy cập thuộc tính
}