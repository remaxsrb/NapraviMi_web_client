import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../../../services/utils/auth-service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
