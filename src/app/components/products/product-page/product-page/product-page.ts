import { Component, OnInit, inject } from '@angular/core';
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

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ImageModule, RatingModule, ButtonModule, Header],
  templateUrl: './product-page.html',
  styleUrl: './product-page.css',
})
export class ProductPage implements OnInit {
  isLoading = true;
  isOwner = false;
  isCustomer = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  product: Product | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/']);
      return;
    }
    this.isCustomer = this.authService.get_role() === 'user';
    const cachedProduct = this.productService.getPreviewProduct();
    if (cachedProduct) {
      this.product = cachedProduct;
      this.isLoading = false;
      this.checkOwnership();
    } else {
      this.router.navigate(['/']);
    }
  }

  private checkOwnership(): void {
    if (this.authService.get_role() !== 'craftsman') return;

    this.isOwner = Number(this.authService.get_craftsman_id()) === this.product?.craftsmanId;
  }

  deleteProduct(): void {
    if (!this.product) return;
    this.productService.delete(this.product.id!, this.product.craftsmanId!).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: () => {},
    });
  }

  addToCart() {
    const payload = {
      cart_id: Number(this.authService.get_id()),
      product_id: this.product?.id,
      quantity: 1
    }
    this.cartService.addToCart(payload).subscribe({
      next: (response: any) => {
        if (!localStorage.getItem('userData')) return;
        const userDataString = localStorage.getItem('userData')!;
        var user: User = JSON.parse(userDataString);
        user.cart = response.cart;

        console.log(user);
        localStorage.setItem('userData', JSON.stringify(user));
      },
    });
  }
}
