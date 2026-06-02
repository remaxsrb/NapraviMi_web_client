import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/utils/auth-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { User } from '../../../models/user';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-userprofile',
  imports: [CommonModule, MenubarModule, MenuModule, ButtonModule, AvatarModule, RouterLink, CardModule, ImageModule],
  templateUrl: './userprofile.html',
  styleUrl: './userprofile.css',
})
export class Userprofile implements OnInit {
  constructor(private authService: AuthService) {}

  user: User = new User();

  menuItems: MenuItem[] = [
    {
      label: 'Odjavi se',
      icon: 'pi pi-sign-in',
      command: () => this.logout(),
    },
  ];

  ngOnInit() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.user = JSON.parse(userData);
      
    }
    console.log('User data loaded in Userprofile component:', this.user);
  }

  logout() {
    this.authService.logout();
  }
}
