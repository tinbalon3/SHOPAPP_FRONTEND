import { Product } from "./product.interface";
import { ProductImages } from "./productimgaes.interface";

export interface ProductDetail {
    product: Product;
    product_images:ProductImages;
}