import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/utils/auth-service';
import { CartService } from '../../../../services/cart/cart-service';
import { UserActions } from '../../user-actions/user-actions';
import { User } from '../../../../models/user';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface HeaderState {
  currentUser: User | undefined;
  isLoggedIn: boolean;
  isUser: boolean;
  cartItemCount: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, BadgeModule, InputTextModule, RouterLink, UserActions],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  searchQuery = '';

  private router = inject(Router);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  readonly state$: Observable<HeaderState> = this.authService.authChanged$.pipe(
    map(() => this.buildState()),
    startWith(this.buildState())
  );

  private buildState(): HeaderState {
    const userData = localStorage.getItem('userData');
    const currentUser = userData ? JSON.parse(userData) : undefined;

    return {
      currentUser,
      isLoggedIn: this.authService.is_LoggedIn(),
      isUser: this.authService.get_role() === 'user',
      cartItemCount: this.cartService.cartItemCount(),
    };
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      this.router.navigate(['']);
      return;
    }
    this.router.navigate(['craftsmen'], { queryParams: { craft: q } });
  }
}


