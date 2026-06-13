import { Product } from "./product";

export class Cart {
    id: number | null = null;
    userId: number | null = null;
    items: CartItem[] = [];
}

export class CartItem {
    productId: number | null = null;
    quantity: number | null = null;
    product: Product = new Product()
}