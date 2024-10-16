import { CartItem } from "../class/cart-item";
import { CartItemDTO } from "../dtos/cart-item.dto";
import { Address } from "./address.interface";

export interface Order {
    id:number,
    user_id: number;
    fullname: string;
    email: string;
    phone_number: string;
    status:string;
    address: string;
    note: string;
    total_money: number;
    payment_method: string;
    shipping_address:string;
    shipping_method: string;
    coupon_code: string;
    cart_items: CartItemDTO[]; 
}
