import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/utils/auth-service';

@Component({
  selector: 'app-user-actions',
  standalone: true,
  imports: [CommonModule, AvatarModule, MenuModule],
  templateUrl: './user-actions.html',
  styleUrls: ['./user-actions.css'],
})
export class UserActions {
  @Input() user: User | undefined;

  menuItems: MenuItem[] = [];

  constructor(private authService: AuthService) {
    this.menuItems = [
      {
        label: 'Мој профил',
        icon: 'pi pi-user',
        routerLink: '/profile'

      },
      {
        label: 'Подешавања',
        icon: 'pi pi-cog',
        routerLink: '/settings',
      },
      {
        label: 'Одјави се',
        icon: 'pi pi-sign-in',
        command: () => this.logout(),
      },
    ];
  }


  logout() {
    this.authService.logout();
  }
}
