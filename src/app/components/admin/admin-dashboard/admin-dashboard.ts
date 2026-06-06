import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/utils/auth-service';
import { UserActions } from '../../common/user-actions/user-actions';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule, RouterOutlet, UserActions],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
   user: User = new User();

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

}
