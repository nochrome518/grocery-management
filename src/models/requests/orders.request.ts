export class CreateOrderRequest {
    productId: number;
    quantity: number;
    price?: number;
}

export interface SearchOrderRequest {
    pageSize: number;
    pageIndex: number;
}