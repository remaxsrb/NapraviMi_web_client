import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/utils/auth-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenubarModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  @Output() addProductClick = new EventEmitter<void>();

  items: MenuItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildItems();
    this.authService.authChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => this.buildItems());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildItems(): void {
    const role = this.authService.get_role();
    const isLoggedIn = this.authService.is_LoggedIn();

    if (role === 'admin') {
      this.items = [
        { label: 'Zahtevi zanatlija', icon: 'pi pi-list', routerLink: '/admin/craftsman-applications' },
        { label: 'Postavi uloge', icon: 'pi pi-user-edit', routerLink: '/admin/set-roles' },
      ];
    } else if (role === 'craftsman') {
      this.items = [
        { label: 'Pregled zanatlija', icon: 'pi pi-users', command: () => this.router.navigate(['craftsmen']) },
        { label: 'Dodaj proizvod', icon: 'pi pi-plus', routerLink: '/craftsman/add-product' },
      ];
    } else {
      this.items = [
        ...(!isLoggedIn || role === 'user' ? [{ label: 'Postani Zanatlija', icon: 'pi pi-list', routerLink: '/craftsman-apply' }] : []),
        { label: 'Pregled zanatlija', icon: 'pi pi-users', command: () => this.router.navigate(['craftsmen']) },
      ];
    }
  }
}
