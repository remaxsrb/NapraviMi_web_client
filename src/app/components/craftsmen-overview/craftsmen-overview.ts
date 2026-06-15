import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RatingModule } from 'primeng/rating';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CraftsmanService } from '../../services/craftsman/craftsman-service';
import { CraftService } from '../../services/craft/craft-service';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { map, switchMap, startWith, catchError, tap } from 'rxjs/operators';
import { UserService } from '../../services/user/user-service';
import { User } from '../../models/user';
import { CraftOption } from '../../interfaces/craft-option';

interface PaginationEvent {
  first: number;
  rows: number;
}

interface CraftsmenState {
  craftsmen: User[];
  isLoading: boolean;
  totalRecords: number;
  activeCraft: string | null;
  activeCraftLabel: string | null;
  first: number;
  rows: number;
}

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
export class CraftsmenOverview {
  private craftsmanService = inject(CraftsmanService);
  private craftService = inject(CraftService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private paginationSubject$ = new BehaviorSubject<PaginationEvent>({
    first: 0,
    rows: 6,
  });

  readonly state$: Observable<CraftsmenState> = combineLatest([
    this.route.queryParamMap,
    this.craftService.getCraftOptions(),
    this.paginationSubject$,
  ]).pipe(
    switchMap(([params, craftOptions, pagination]) => {
      const craft = params.get('craft');
      const activeCraftLabel = craft
        ? craftOptions.find((c) => c.value === craft)?.label || craft
        : null;

      // Reset pagination when craft filter changes
      const adjustedPagination =
        craft && pagination.first > 0 ? { first: 0, rows: pagination.rows } : pagination;
      if (adjustedPagination.first !== pagination.first) {
        this.paginationSubject$.next(adjustedPagination);
      }

      return this.fetchCraftsmen(craft, adjustedPagination).pipe(
        map((response) => ({
          craftsmen: response?.data?.craftsmen || [],
          isLoading: false,
          totalRecords: response?.data?.total || 0,
          activeCraft: craft,
          activeCraftLabel,
          first: adjustedPagination.first,
          rows: adjustedPagination.rows,
        })),
        startWith({
          craftsmen: [],
          isLoading: true,
          totalRecords: 0,
          activeCraft: craft,
          activeCraftLabel,
          first: adjustedPagination.first,
          rows: adjustedPagination.rows,
        }),
        catchError(() =>
          EMPTY.pipe(
            startWith({
              craftsmen: [],
              isLoading: false,
              totalRecords: 0,
              activeCraft: craft,
              activeCraftLabel,
              first: adjustedPagination.first,
              rows: adjustedPagination.rows,
            })
          )
        )
      );
    }),
    startWith({
      craftsmen: [],
      isLoading: true,
      totalRecords: 0,
      activeCraft: null,
      activeCraftLabel: null,
      first: 0,
      rows: 6,
    })
  );

  clearFilter(): void {
    this.router.navigate([], { queryParams: {} });
  }

  onPageChange(event: any): void {
    this.paginationSubject$.next({
      first: event.first,
      rows: event.rows,
    });
  }

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

  private fetchCraftsmen(
    craft: string | null,
    pagination: PaginationEvent
  ): Observable<any> {
    if (craft) {
      return this.craftsmanService.getByCraft(craft, pagination.first, pagination.rows);
    } else {
      return this.craftsmanService.all({
        limit: pagination.rows,
        skip: pagination.first,
      });
    }
  }
}
