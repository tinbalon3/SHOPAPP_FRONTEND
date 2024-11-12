import { Product } from "../../models/product.interface";

export interface ProductResponse {
    products: Product[]
    totalElements:number
    totalPages:number
}