import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/utils/auth-service';
import { UserActions } from '../../common/user-actions/user-actions';
import { AddProduct } from '../../products/add-product/add-product';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule, UserActions, AddProduct],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard implements OnInit {
  user: User = new User();
  menuItems: MenuItem[] = [];
  showAddProduct = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      this.user = JSON.parse(storedUser) as User;
    }

    if (this.authService.get_role() === 'craftsman') {
      this.menuItems = [
        {
          label: 'Dodaj proizvod',
          icon: 'pi pi-plus',
          command: () => { this.showAddProduct = !this.showAddProduct; },
        },
      ];
    }
  }

  get userRole(): string {
    const role = this.authService.get_role();
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
