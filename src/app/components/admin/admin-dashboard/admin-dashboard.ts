import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/utils/auth-service';
import { UserActions } from '../../common/user-actions/user-actions';
import { Navbar } from '../../common/navbar/navbar/navbar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterOutlet, UserActions, Navbar],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  user: User = new User();
  role: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      this.user = JSON.parse(storedUser) as User;
    }
    this.role = this.authService.get_role();
  }
}
