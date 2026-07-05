import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../../../services/utils/auth-service';
import { Observable, merge } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';

interface NavbarState {
  items: MenuItem[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenubarModule, AsyncPipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Output() addProductClick = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);

  readonly state$: Observable<NavbarState> = merge(
    this.authService.authChanged$,
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
  ).pipe(
    map(() => ({ items: this.buildItems() })),
    startWith({ items: this.buildItems() })
  );

  private buildItems(): MenuItem[] {
    const role = this.authService.get_role();
    const isLoggedIn = this.authService.is_LoggedIn();

    if (role === 'admin') {
      return [
        { label: 'Захтеви занатлија', icon: 'pi pi-list', routerLink: '/admin/craftsman-applications' },
        { label: 'Постави улоге', icon: 'pi pi-user-edit', routerLink: '/admin/set-roles' },
      ];
    } else if (role === 'craftsman') {
      return [
        { label: 'Преглед занатлија', icon: 'pi pi-users', command: () => this.router.navigate(['craftsmen']) },
        { label: 'Поруџбине', icon: 'pi pi-shopping-bag', routerLink: '/craftsman/orders' },
        { label: 'Додај производ', icon: 'pi pi-plus', routerLink: '/craftsman/add-product' },
      ];
    } else {
      return [
        ...(!isLoggedIn || role === 'user' ? [{ label: 'Постани Занатлија', icon: 'pi pi-list', routerLink: '/craftsman-apply' }] : []),
        { label: 'Преглед занатлија', icon: 'pi pi-users', command: () => this.router.navigate(['craftsmen']) },
        ...(isLoggedIn && role === 'user' && !this.isGuestView() ? [{ label: 'Поруџбине', icon: 'pi pi-shopping-bag', routerLink: '/user/orders' }] : []),
      ];
    }
  }

  private isGuestView(): boolean {
    const match = this.router.url.match(/^\/profile\/(.+)/);
    if (!match) return false;
    const urlUsername = decodeURIComponent(match[1]);
    const userData = localStorage.getItem('userData');
    const loggedInUser = userData ? JSON.parse(userData) : null;
    return loggedInUser?.username !== urlUsername;
  }
}
