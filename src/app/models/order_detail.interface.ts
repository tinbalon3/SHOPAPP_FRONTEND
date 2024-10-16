import { Product } from "../dtos/product.dto";


export interface OrderDetail {
    id:string;
    price:any;
    numberOfProduct:number;
    totalMoney:number;
    product:Product;
}