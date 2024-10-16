import { CartItem } from "../class/cart-item";

export class CartItemDTO {
    product_id:number;
    quantity:number;
    constructor(theCartItem: CartItem){
        this.product_id = theCartItem.id;
        this.quantity = theCartItem.quantity
    }
}