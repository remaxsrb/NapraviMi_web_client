import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/utils/auth-service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule, AvatarModule, MenuModule, RouterLink, RouterOutlet],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
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

  adminMenuItems: MenuItem[] = [
    {
      label: 'Zahtevi zanatlija',
      icon: 'pi pi-list',
      routerLink: '/admin/craftsman-applications',
    },
    {
      label: 'Postavi uloge',
      icon: 'pi pi-user-edit',
      routerLink: '/admin/set-roles',
    },
  ];

   role: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      this.user = JSON.parse(storedUser) as User;
    }
    const role = this.authService.get_role();
    this.role = role;

  }

   logout() {
    this.authService.logout();
  }
}
