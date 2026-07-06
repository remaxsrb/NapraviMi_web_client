import { CreditCardData, PaymentMethod } from './payment';

export interface OrderItemRequest {
  product_id: number;
  quantity: number;
}

export interface NewOrderRequest {
  craftsman_id: number;
  items: OrderItemRequest[];
  payment_type: PaymentMethod;
  shipping_address: string;
  credit_card_data?: CreditCardData;
}

export interface CreateOrderResponse {
  url: string;
}

export interface OrderResponse {
  order_id: number;
  order_date: string;
  completion_date?: string;
  url?: string;
  status?: string;
  customer_id?: number;
  craftsman_id?: number;
}

export interface CategoryOrderCount {
  category: string;
  count: number;
}

export interface GetAllOrdersResponse {
  orders: OrderResponse[];
  total?: number;
  page?: number;
  category_counts?: CategoryOrderCount[];
}

export interface CheckoutResponse {
  orders: OrderResponse[];
}

export interface MonthlyOrderStat {
  month: string;
  count: number;
}
