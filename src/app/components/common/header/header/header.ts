import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, BadgeModule, InputTextModule, RouterLink, UserActions],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  searchQuery = '';
  currentUser: User | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.authService.authChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadUser());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUser(): void {
    const userData = localStorage.getItem('userData');
    this.currentUser = userData ? JSON.parse(userData) : undefined;
  }

  get isLoggedIn(): boolean {
    return this.authService.is_LoggedIn();
  }

  get isUser(): boolean {
    return this.authService.get_role() === 'user';
  }

  get cartItemCount() {
    return this.cartService.cartItemCount();
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


