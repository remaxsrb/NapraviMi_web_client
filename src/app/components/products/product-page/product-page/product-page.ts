import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { RatingModule } from 'primeng/rating';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../services/product/product-service';
import { AuthService } from '../../../../services/utils/auth-service';
import { Product } from '../../../../models/product';
import { Header } from '../../../common/header/header/header';
import { CartService } from '../../../../services/cart/cart-service';
import { User } from '../../../../models/user';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface ProductPageState {
  product: Product | null;
  isLoading: boolean;
  isOwner: boolean;
  isCustomer: boolean;
}

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ImageModule, RatingModule, ButtonModule, Header],
  templateUrl: './product-page.html',
  styleUrl: './product-page.css',
})
export class ProductPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  readonly state$: Observable<ProductPageState> = this.buildState();

  addToCart(): void {
    const cachedProduct = this.productService.getPreviewProduct();
    if (!cachedProduct) return;

    const payload = {
      cart_id: Number(this.authService.get_id()),
      product_id: cachedProduct.id,
      quantity: 1,
    };

    this.cartService.addToCart(payload).subscribe({
      next: (response: any) => {
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) return;

        const user: User = JSON.parse(userDataString);
        user.cart = response.cart;
        localStorage.setItem('userData', JSON.stringify(user));
      },
    });
  }

  deleteProduct(): void {
    const cachedProduct = this.productService.getPreviewProduct();
    if (!cachedProduct) return;

    this.productService.delete(cachedProduct.id!).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: () => {},
    });
  }

  private buildState(): Observable<ProductPageState> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const cachedProduct = this.productService.getPreviewProduct();
    const isCustomer = this.authService.get_role() === 'user';

    if (!id || !cachedProduct) {
      this.router.navigate(['/']);
      return new Observable((observer) => {
        observer.next({
          product: null,
          isLoading: false,
          isOwner: false,
          isCustomer,
        });
      });
    }

    const isOwner =
      this.authService.get_role() === 'craftsman' &&
      Number(this.authService.get_craftsman_id()) === cachedProduct.craftsmanId;

    return new Observable((observer) => {
      observer.next({
        product: cachedProduct,
        isLoading: false,
        isOwner,
        isCustomer,
      });
      observer.complete();
    });
  }
}
