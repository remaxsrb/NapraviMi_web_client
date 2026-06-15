import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/utils/auth-service';
import { UserActions } from '../../common/user-actions/user-actions';
import { Navbar } from '../../common/navbar/navbar/navbar';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface AdminDashboardState {
  user: User;
  role: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterOutlet, UserActions, Navbar],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  private authService = inject(AuthService);

  readonly state$: Observable<AdminDashboardState> = this.authService.authChanged$.pipe(
    map(() => this.buildState()),
    startWith(this.buildState())
  );

  private buildState(): AdminDashboardState {
    const storedUser = localStorage.getItem('userData');
    const user = storedUser ? (JSON.parse(storedUser) as User) : new User();
    return {
      user,
      role: this.authService.get_role(),
    };
  }
}
