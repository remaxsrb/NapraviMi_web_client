import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { map, tap } from 'rxjs';
import { Cart } from '../../models/cart';
import { CheckoutPayload } from '../../interfaces/payment';
import { CheckoutResponse } from '../../interfaces/order';
import { API_BASE_URL } from '../../env';
import { unwrapCart, unwrapEnvelope } from '../utils/response-envelope';

export type { CheckoutResponse };

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${API_BASE_URL}/carts`;

  cartItemCount = signal(this.readPersistedCartItemCount());

  constructor(private http: HttpClient) {}

  private readPersistedCartItemCount(): number {
    const userData = localStorage.getItem('userData');
    if (!userData) return 0;

    try {
      return JSON.parse(userData)?.cart?.items?.length ?? 0;
    } catch {
      return 0;
    }
  }

  addToCart(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/add`, payload).pipe(
      map(unwrapEnvelope),
      map(unwrapCart),
      tap((cart: Cart) => this.cartItemCount.set(cart?.items?.length ?? 0)),
    );
  }

  removeFromCart(payload : any) {
    return this.http.post<any>(`${this.apiUrl}/remove`, payload).pipe(
      map(unwrapEnvelope),
      map(unwrapCart),
      tap((cart: Cart) => this.cartItemCount.set(cart?.items?.length ?? 0)),
    );
  }

  checkout(payload: CheckoutPayload) {
    return this.http
      .post<{ data: CheckoutResponse } | CheckoutResponse>(`${this.apiUrl}/checkout`, payload)
      .pipe(map(unwrapEnvelope));
  }
}
