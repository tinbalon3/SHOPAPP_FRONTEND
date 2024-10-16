import { Role } from "../../../models/role.interface";

export interface UserResponseManagement {
    id:number
    fullname:string;
    phone_number:string;
    email:string
    address:string;
    active:boolean;
    role_id:Role;
   
}