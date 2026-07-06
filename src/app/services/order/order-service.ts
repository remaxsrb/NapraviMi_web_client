import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetAllOrdersResponse, MonthlyOrderStat } from '../../interfaces/order';
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

  getOrdersByCraftsman(skip: number = 0, limit: number = 10) {
    return this.http.get<{data: GetAllOrdersResponse}>(`${this.url}/craftsmen/me`, {
      params: { skip: skip.toString(), limit: limit.toString() },
    });
  }

  acceptOrder(order_id: number) {
    return this.http.post<{status:string}>(`${this.url}/accept`, { order_id });
  }

  rejectOrder(order_id: number) {
    return this.http.post<{status:string}>(`${this.url}/decline`, { order_id });
  }

  deliverOrder(order_id: number, customer_id: number) {
    return this.http.post<{status:string}>(`${this.url}/ship`, { order_id, customer_id });
  }

  getShippedOrdersMonthlyStats(from?: string, to?: string) {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return this.http.get<{data: MonthlyOrderStat[]}>(`${this.url}/stats/monthly`, { params });
  }
}

