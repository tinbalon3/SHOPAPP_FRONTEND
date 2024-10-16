import { Product } from "../models/product.interface";


export class CartItem {

    id!:number;
    name: string;
    thumbnail:string;
    price:number;
    quantity:number;
    constructor(product:Product){
     
        this.name = product.name;
        this.thumbnail = product.thumbnail;
        this.price = product.price;
        this.quantity = 1;
    }
}