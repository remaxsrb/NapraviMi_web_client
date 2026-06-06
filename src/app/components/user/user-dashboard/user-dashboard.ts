import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/utils/auth-service';
import { UserActions } from '../../common/user-actions/user-actions';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule, UserActions],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard implements OnInit {
  user: User = new User();

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
}
