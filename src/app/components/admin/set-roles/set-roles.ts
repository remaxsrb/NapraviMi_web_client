import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { UserService } from '../../../services/user/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiUser, RoleOption, UserRoleRow } from '../../../interfaces/admin-user';

@Component({
  selector: 'app-set-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, SelectModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService, UserService],
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
    { label: 'Корисник', value: 'user' },
    { label: 'Занатлија', value: 'craftsman' },
    { label: 'Admin', value: 'admin' },
  ];

  private userService: UserService = inject(UserService);
  private confirmationService: ConfirmationService = inject(ConfirmationService);
  private messageService: MessageService = inject(MessageService);

  constructor(private cdr: ChangeDetectorRef) {}

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

  onRoleChange(event: any, user: UserRoleRow): void {
    const newRole = event.value;
    if (newRole === user.role) {
      return;
    }

    const roleLabel = this.roleOptions.find((r) => r.value === newRole)?.label ?? newRole;

    this.confirmationService.confirm({
      message: `Да ли сте сигурни да желите да промените улогу корисника <b>${user.email}</b> на <b>${roleLabel}</b>?`,
      header: 'Потврда промене улоге',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Да',
      rejectLabel: 'Не',
      accept: () => {
        const requestData = {
          username: user.username,
          role:newRole,
        };
        this.userService.setRole(requestData).subscribe({
          next: () => {
            user.role = newRole;
            user.newRole = newRole;
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: `Улога корисника ${user.email} је успешно промењена на ${roleLabel}.` });
            this.cdr.detectChanges();
          },
          error: () => {
            user.newRole = user.role;
            this.messageService.add({ severity: 'error', summary: 'Грешка', detail: `Дошло је до грешке приликом промене улоге корисника ${user.email}.` });
            this.cdr.detectChanges();
          },
        });
      },
      reject: () => {
        user.newRole = user.role;
      },
    });
  }

}
