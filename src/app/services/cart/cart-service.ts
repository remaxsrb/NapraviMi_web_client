import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { map, tap } from 'rxjs';
import { Cart } from '../../models/cart';
import { CheckoutPayload } from '../../interfaces/payment';
import { CheckoutResponse } from '../../interfaces/order';
import { API_BASE_URL } from '../../env';
import { unwrapEnvelope } from '../utils/response-envelope';

export type { CheckoutResponse };

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${API_BASE_URL}/carts`;

  cartItemCount = signal(0);

  constructor(private http: HttpClient) {}

  addToCart(payload: any) {
    return this.http.post<{ data: Cart } | Cart>(`${this.apiUrl}/add`, payload).pipe(
      map(unwrapEnvelope),
      tap((cart) => this.cartItemCount.set(cart?.items?.length ?? 0)),
    );
  }

  removeFromCart(payload : any) {
    return this.http.post<{ data: Cart } | Cart>(`${this.apiUrl}/remove`, payload).pipe(
      map(unwrapEnvelope),
      tap((cart) => this.cartItemCount.set(cart?.items?.length ?? 0)),
    );
  }

  checkout(payload: CheckoutPayload) {
    return this.http
      .post<{ data: CheckoutResponse } | CheckoutResponse>(`${this.apiUrl}/checkout`, payload)
      .pipe(map(unwrapEnvelope));
  }
}
