import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderResponse, NewOrderRequest } from '../../interfaces/order';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private orderApiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  createOrder(orderRequest: NewOrderRequest) {
    return this.http.post<CreateOrderResponse>(`${this.orderApiUrl}/create`, orderRequest);
  }
}

