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
        label: 'Moj profil',
        icon: 'pi pi-user',
        routerLink: this.getProfileLink(),
      },
      {
        label: 'Podešavanja',
        icon: 'pi pi-cog',
        routerLink: '/change-password',
      },
      {
        label: 'Odjavi se',
        icon: 'pi pi-sign-in',
        command: () => this.logout(),
      },
    ];
  }

  private getProfileLink(): string {
    const role = this.authService.get_role();
    return role === 'craftsman' ? '/craftsman-profile' : '/user-profile';
  }

  logout() {
    this.authService.logout();
  }
}
