import { Product } from "../../models/product.interface";

export interface ProductResponse {
    products: Product[]
    totalPages:number
}