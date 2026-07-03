import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderResponse, NewOrderRequest } from '../../interfaces/order';
import { API_BASE_URL } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private orderApiUrl = `${API_BASE_URL}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderRequest: NewOrderRequest) {
    return this.http.post<CreateOrderResponse>(`${this.orderApiUrl}/create`, orderRequest);
  }
}

