import { ProductImages } from "../models/productimgaes.interface"

export interface ProductDetailDTO {
    id:number
    name:string
    price: number
    thumbnail:string
    description:string
    category_id:number
    stock:number
    url:string
    color:string;
    number_of_rating :number
    sum_of_rating:number
    product_images: ProductImages[]
}