import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { Cart } from '../../models/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:8080/cart';

  cartItemCount = signal(0);

  constructor(private http: HttpClient) {}

  addToCart(payload: any) {
    return this.http.post<Cart>(`${this.apiUrl}/add`,payload).pipe(
      tap((cart) => this.cartItemCount.set(cart?.items?.length ?? 0)),
    );
  }

  removeFromCart(payload : any) {
    return this.http.post<Cart>(`${this.apiUrl}/remove`,payload).pipe(
      tap((cart) => this.cartItemCount.set(cart?.items?.length ?? 0)),
    );
  }
}
