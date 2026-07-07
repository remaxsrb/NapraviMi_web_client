import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/utils/auth-service';
import { CartService } from '../../../../services/cart/cart-service';
import { ThemeService } from '../../../../services/utils/theme-service';
import { UserActions } from '../../user-actions/user-actions';
import { User } from '../../../../models/user';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface HeaderState {
  currentUser: User | undefined;
  isLoggedIn: boolean;
  isUser: boolean;
  homeLink: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, BadgeModule, InputTextModule, RouterLink, UserActions],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() logoOnly = false;
  @Input() hideSearchAndTheme = false;
  searchQuery = '';

  private router = inject(Router);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  readonly themeService = inject(ThemeService);
  readonly cartItemCount = this.cartService.cartItemCount;

  readonly state$: Observable<HeaderState> = this.authService.authChanged$.pipe(
    map(() => this.buildState()),
    startWith(this.buildState())
  );

  private buildState(): HeaderState {
    const userData = localStorage.getItem('userData');
    const currentUser = userData ? JSON.parse(userData) : undefined;
    const isLoggedIn = this.authService.is_LoggedIn();
    const role = this.authService.get_role();

    return {
      currentUser,
      isLoggedIn,
      isUser: role === 'user',
      homeLink: this.resolveHomeLink(isLoggedIn, role),
    };
  }

  private resolveHomeLink(isLoggedIn: boolean, role: string): string {
    if (!isLoggedIn) return '/';
    if (role === 'admin') return '/admin';
    if (role === 'craftsman') return '/craftsman';
    if (role === 'user') return '/user';
    return '/';
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


