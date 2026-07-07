import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CartService } from '../../../services/cart/cart-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface CartState {
  cartId: number;
  cartItems: any[];
  total_price: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ButtonModule, TableModule, TagModule, CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private cartService = inject(CartService);
  private router = inject(Router);

  private cartStateSubject$ = new BehaviorSubject<CartState>(this.loadInitialState());

  readonly state$: Observable<CartState> = this.cartStateSubject$.asObservable();

  removeFromCart(item: any): void {
    const currentState = this.cartStateSubject$.value;
    const payload = {
      cart_id: currentState.cartId,
      product_id: item.product.id,
    };

    this.cartService
      .removeFromCart(payload)
      .pipe(
        tap((cart: any) => {
          const newCartItems = cart?.items || [];
          const newTotal = cart?.total;

          // Update localStorage
          const userData = localStorage.getItem('userData');
          if (userData) {
            const user = JSON.parse(userData);
            user.cart.items = newCartItems;
            user.cart.total = newTotal;
            localStorage.setItem('userData', JSON.stringify(user));
          }

          // Update state
          this.cartStateSubject$.next({
            cartId: currentState.cartId,
            cartItems: newCartItems,
            total_price: newTotal,
          });
        })
      )
      .subscribe();
  }

  private loadInitialState(): CartState {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      return {
        cartId: 0,
        cartItems: [],
        total_price: 0,
      };
    }

    const user = JSON.parse(userData);
    return {
      cartId: user.cart.id,
      cartItems: user.cart.items,
      total_price: user.cart.total,
    };
  }

  placeOrder(): void {
    this.router.navigate(['/payment']);
  }
}
