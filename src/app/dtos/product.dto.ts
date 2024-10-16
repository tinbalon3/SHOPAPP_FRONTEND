export interface Product {
    createdAt: string;
    updatedAt: string;
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