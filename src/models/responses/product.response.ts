import { Product } from "../entities/product.entity";

export class ProductResponse {
    products: Product[];
    total: number;
    count: number;
    page: number;
    pageCount?: number;
}