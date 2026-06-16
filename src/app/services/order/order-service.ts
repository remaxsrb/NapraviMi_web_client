import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface OrderResponse {
  order_id: number;
  order_date: string;
  completion_date?: string;
  url?: string;
  status?: string;
}

export interface GetAllOrdersResponse {
  orders: OrderResponse[];
  total?: number;
  page?: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {


  private url = 'http://localhost:8080/orders';

  constructor(
    private http: HttpClient
  ) {}

  getOrdersByCustomer(user_id: number, page: number = 1, limit: number = 10) {
    return this.http.get<{data: GetAllOrdersResponse}>(`${this.url}/customer/${user_id}`, {
      params: { page: page.toString(), limit: limit.toString() },
    });
  }

  getOrdersByCraftsman(craftsman_id: number, page: number = 1, limit: number = 10) {
    return this.http.get<{data: GetAllOrdersResponse}>(`${this.url}/craftsman/${craftsman_id}`, {
      params: { page: page.toString(), limit: limit.toString() },
    });
  }
}
