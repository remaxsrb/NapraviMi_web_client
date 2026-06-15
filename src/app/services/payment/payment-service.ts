import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface OrderItemRequest {
  product_id: number;
  quantity: number;
}

export interface CreditCardData {
  owner_name: string;
  card_number: string;
  expiration_date: string;
  cvv: string;
}

export interface NewOrderRequest {
  craftsman_id: number;
  items: OrderItemRequest[];
  payment_type: 'cash' | 'card';
  shipping_address: string;
  credit_card_data?: CreditCardData;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private orderApiUrl = 'http://localhost:8080/orders';

  constructor(private http: HttpClient) {}

  createOrder(orderRequest: NewOrderRequest) {
    return this.http.post<any>(`${this.orderApiUrl}`, orderRequest);
  }
}
