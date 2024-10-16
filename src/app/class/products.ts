
import {Product} from '../models/product.interface'
export class Item {
    id!: number;
    name: string;
    price: number;
    thumbnail: string;
    description: string;
    categoryId: number;
    url: string
    constructor(theProduct:Product
    ) {
        this.name = theProduct.name
        this.price = theProduct.price;
        this.thumbnail = theProduct.thumbnail;
        this.description = theProduct.description;
        this.categoryId = theProduct.category_id;
        this.url = theProduct.url
     }
}