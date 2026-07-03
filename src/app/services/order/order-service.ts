import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetAllOrdersResponse } from '../../interfaces/order';
import { API_BASE_URL } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class OrderService {


  private url = `${API_BASE_URL}/orders`;

  constructor(
    private http: HttpClient
  ) {}

  getOrdersByCustomer(user_id: number, skip: number = 0, limit: number = 10) {
    return this.http.get<{data: GetAllOrdersResponse}>(`${this.url}/customer/${user_id}`, {
      params: { skip: skip.toString(), limit: limit.toString() },
    });
  }

  getOrdersByCraftsman(craftsman_id: number, skip: number = 0, limit: number = 10) {
    return this.http.get<{data: GetAllOrdersResponse}>(`${this.url}/craftsman/${craftsman_id}`, {
      params: { skip: skip.toString(), limit: limit.toString() },
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

