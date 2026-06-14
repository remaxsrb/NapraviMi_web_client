import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CartService } from '../../../services/cart/cart-service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ButtonModule, RatingModule, TableModule, TagModule, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  constructor(private cartService: CartService) {}

  cartId: number = 0;
  cartItems: any[] = [];
  total_price : number = 0;

  ngOnInit(): void {
    const userData = localStorage.getItem('userData');
    if (!userData) return;
    const user = JSON.parse(userData);
    this.cartId = user.cart.id;
    this.cartItems = user.cart.items;
    this.total_price = user.cart.total
  }

  removeFromCart(item: any) {
    const payload = {
      cart_id : this.cartId,
      product_id : item.product.id,
      quantity: item.quantity
    }
    this.cartService.removeFromCart(payload).subscribe({
      next: (response: any) => {
        if (response.quantity === 0) {
          this.cartItems = this.cartItems.filter((item) => item.ProductID !== response.ProductID);
          const userData = localStorage.getItem('userData');
          if (!userData) return;
          var user = JSON.parse(userData)
          user.cart.items = this.cartItems;
          this.total_price = user.cart.total = response.cart.total
          localStorage.setItem("userData", JSON.stringify(user))
        }
      },
    });
  }
}
