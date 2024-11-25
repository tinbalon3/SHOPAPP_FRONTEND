import { CartItemDTO } from "../dtos/cart-item.dto";
import { Address } from "../models/address.interface";
import { Customer } from "../models/customer.interface";


export interface Purchase{
    customer:Customer;
    shipping_address:Address;
    // billing_address:Address;
    note:string;
    totalAmount:number;
    shipping_method:string;
    payment_method:string;
    cart_items: CartItemDTO[]; 
    reason:string;
}