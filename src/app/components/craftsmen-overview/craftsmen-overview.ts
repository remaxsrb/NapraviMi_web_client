import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RatingModule } from 'primeng/rating';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CraftsmanService } from '../../services/craftsman/craftsman-service';
import { craftLabel } from '../../constants/craft-options';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../services/user/user-service';
import { AuthService } from '../../services/utils/auth-service';
import { User } from '../../models/user';

@Component({
  selector: 'app-craftsmen-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    RatingModule,
    PaginatorModule,
    ButtonModule,
  ],
  templateUrl: './craftsmen-overview.html',
  styleUrl: './craftsmen-overview.css',
})
export class CraftsmenOverview implements OnInit, OnDestroy {
  craftsmen: User[] = [];
  isLoading = false;
  pageSize = 6;
  first = 0;
  totalRecords = 0;
  activeCraft: string | null = null;
  activeCraftLabel: string | null = null;

  private craftsmanService = inject(CraftsmanService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const craft = params.get('craft');
      this.activeCraft = craft;
      this.activeCraftLabel = craft ? craftLabel(craft) || craft : null;
      this.first = 0;
      this.loadCraftsmen();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearFilter(): void {
    this.router.navigate([], { queryParams: {} });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.pageSize = event.rows;
    this.loadCraftsmen();
  }

  // Inside CraftsmenOverview
  onSelectCraftsman(craftsman: User): void {
    const userData = localStorage.getItem('userData');
    const loggedInUser = userData ? JSON.parse(userData) : null;
    if (loggedInUser?.username === craftsman.username) {
      this.router.navigate(['/profile']);
    } else {
      this.userService.setPreviewUser(craftsman);
      this.router.navigate(['/profile', craftsman.username]);
    }
  }

  private loadCraftsmen(): void {
    this.isLoading = true;

    if (this.activeCraft) {
      this.craftsmanService.getByCraft(this.activeCraft, this.first, this.pageSize).subscribe({
        next: (response: any) => {
          this.craftsmen = response?.data?.craftsmen || [];
          this.totalRecords = response?.data?.total || 0;
          this.isLoading = false;
        },
        error: () => {
          this.craftsmen = [];
          this.isLoading = false;
        },
      });
    } else {
      this.craftsmanService.all({ limit: this.pageSize, skip: this.first }).subscribe({
        next: (response: any) => {
          this.craftsmen = response?.data?.craftsmen || [];
          this.totalRecords = response?.data?.total || 0;
          this.isLoading = false;
        },
        error: () => {
          this.craftsmen = [];
          this.isLoading = false;
        },
      });
    }
  }
}
