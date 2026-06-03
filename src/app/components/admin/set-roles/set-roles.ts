import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { UserService } from '../../../services/user/user-service';

interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface RoleOption {
  label: string;
  value: string;
}

interface UserRoleRow {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: string;
  newRole: string;
  createdAt: Date;
}

interface GetAllResponse {
  users: ApiUser[];
  total?: number;
  page?: number;
}

@Component({
  selector: 'app-set-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, SelectModule],
  templateUrl: './set-roles.html',
  styleUrls: ['./set-roles.css'],
})
export class SetRoles {
  users: UserRoleRow[] = [];
  displayedUsers: UserRoleRow[] = [];
  first = 0;
  backendLimit = 5;
  totalRecords = 0;
  isLoading = false;
  private initialLazyLoadHandled = false;
  roleOptions: RoleOption[] = [
    { label: 'Korisnik', value: 'user' },
    { label: 'Zanatlija', value: 'craftsman' },
    { label: 'Admin', value: 'admin' },
  ];

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  pageChange(event: any): void {
    const skip = event.first ?? 0;
    const rows = event.rows ?? this.backendLimit;

    if (!this.initialLazyLoadHandled) {
      this.initialLazyLoadHandled = true;
      setTimeout(() => this.loadPage(skip, rows));
      return;
    }

    setTimeout(() => this.loadPage(skip, rows));
  }

  private loadPage(skip: number, limit: number): void {
    this.isLoading = true;
    const requestData: any = {
      limit,
      skip,
    };

    this.userService.all(requestData).subscribe({
      next: (response) => {
        this.users = response.users.map((user) => this.mapApiUserToRoleRow(user));
        this.displayedUsers = this.users;
        this.first = skip;
        this.backendLimit = limit;
        this.totalRecords = response.total;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.users = [];
        this.displayedUsers = [];
        this.totalRecords = 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private mapApiUserToRoleRow(user: ApiUser): UserRoleRow {
    const currentRole = user.role || 'user';

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: `${user.first_name} ${user.last_name}`,
      role: currentRole,
      newRole: currentRole,
      createdAt: new Date(user.created_at),
    };
  }

}
