import { Order } from "../../models/order.interface";


export interface OrdersResponse {
    orders: Order[]
    totalPages:number
}