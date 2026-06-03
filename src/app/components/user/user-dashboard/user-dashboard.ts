import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/utils/auth-service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule, AvatarModule, MenuModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard implements OnInit {
  user: User = new User();

  menuItems: MenuItem[] = [
    {
      label: 'Moj profil',
      icon: 'pi pi-user',
      routerLink: '/user-profile',
    },
    {
      label: 'Odjavi se',
      icon: 'pi pi-sign-in',
      command: () => this.logout(),
    },
  ];

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
      case 'user':
        return 'Korisnik';
      case 'craftsman':
        return 'Zanatlija';
      default:
        return 'Nepoznata uloga';
    }
  }

  logout() {
    this.authService.logout();
  }
}
