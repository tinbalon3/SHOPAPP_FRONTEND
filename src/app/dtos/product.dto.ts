export interface Product {
    id: number;
    name: string;
    price: any;
    thumbnail: string;
    description: string;
    category: {
        id: number;
        name: string;
    };
}