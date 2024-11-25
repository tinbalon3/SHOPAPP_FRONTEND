import { ProductDetailDTO } from "../dtos/product_detail.dto";
import { Product } from "../models/product.interface";


export class CartItem {

    id:number;
    name: string;
    thumbnail:string;
    price:number;
    quantity:number;
    number_of_rating :number
    sum_of_rating:number
    constructor(product:ProductDetailDTO){
        this.id = product.id
        this.name = product.name;
        this.thumbnail = product.thumbnail;
        this.price = product.price;
        this.quantity = 1;
        this.number_of_rating = product.number_of_rating
        this.sum_of_rating = product.sum_of_rating
    }
}