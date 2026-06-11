import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/utils/auth-service';
import { AddProduct } from '../../products/add-product/add-product';
import { Header } from "../../common/header/header/header";
import { Navbar } from '../../common/navbar/navbar/navbar';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, AddProduct, Header, Navbar],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard implements OnInit {
  user: User = new User();
  showAddProduct = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      this.user = JSON.parse(storedUser) as User;
    }
  }

  get userRole(): string {
    const role = this.authService.get_role();
    switch (role) {
      case 'user': return 'Korisnik';
      case 'craftsman': return 'Zanatlija';
      default: return 'Nepoznata uloga';
    }
  }
}
