import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/utils/auth-service';
import { AddProduct } from '../../products/add-product/add-product';
import { Header } from "../../common/header/header/header";
import { Navbar } from '../../common/navbar/navbar/navbar';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface UserDashboardState {
  user: User;
  userRole: string;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, AddProduct, Header, Navbar, RouterOutlet],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard {
  showAddProduct = false;

  private authService = inject(AuthService);

  readonly state$: Observable<UserDashboardState> = this.authService.authChanged$.pipe(
    map(() => this.buildState()),
    startWith(this.buildState())
  );

  private buildState(): UserDashboardState {
    const storedUser = localStorage.getItem('userData');
    const user = storedUser ? (JSON.parse(storedUser) as User) : new User();
    const role = this.authService.get_role();

    return {
      user,
      userRole: this.mapRoleToLabel(role),
    };
  }

  private mapRoleToLabel(role: string): string {
    switch (role) {
      case 'user':
        return 'Korisnik';
      case 'craftsman':
        return 'Zanatlija';
      default:
        return 'Nepoznata uloga';
    }
  }
}
