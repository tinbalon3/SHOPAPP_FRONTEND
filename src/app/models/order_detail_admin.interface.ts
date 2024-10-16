import { Address } from "./address.interface"
import { OrderDetail } from "./order_detail.interface"

export interface OrderDetailAdminDTO{
    id: 0
    email: string
    note: string
    status: string
    user_id: 0
    fullname: string
    phone_number: string
    total_money: number
    shipping_method: string 
    shipping_address: Address
    billing_address: Address
    shipping_date: Date
    payment_method:string
    order_details: OrderDetail[]
}