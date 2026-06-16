import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface OrderResponse {
  order_id: number;
  order_date: string;
  completion_date?: string;
  url?: string;
  status?: string;
  customer_id?: number;
  craftsman_id?: number;
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

  acceptOrder(order_id: number, craftsman_id: number) {
    return this.http.post<{status:string}>(`${this.url}/accept`, { order_id, craftsman_id });
  }

  rejectOrder(order_id: number, craftsman_id: number) {
    return this.http.post<{status:string}>(`${this.url}/decline`, { order_id, craftsman_id });
  }
  
  deliverOrder(order_id: number, craftsman_id: number, customer_id: number) {
    return this.http.post<{status:string}>(`${this.url}/ship`, { order_id, craftsman_id, customer_id });
  }
}
