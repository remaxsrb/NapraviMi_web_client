import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../services/utils/auth-service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { User } from '../../../models/user';
import { Header } from '../header/header/header';
import { ProductsByCraftsman } from '../../products/products-by-craftsman/products-by-craftsman/products-by-craftsman';
import { Navbar } from '../navbar/navbar/navbar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user/user-service';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { CraftsmanService } from '../../../services/craftsman/craftsman-service';
import { OrderService } from '../../../services/order/order-service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GetAllOrdersResponse, OrderResponse } from '../../../interfaces/order';
import { RatingResponse } from '../../../interfaces/rating';

interface UserProfileState {
  user: User;
  isGuestView: boolean;
  userRole: string;
  isNotTheOwner: boolean;
}

@Component({
  selector: 'app-userprofile',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ImageModule,
    Header,
    ProductsByCraftsman,
    Navbar,
    RatingModule,
    FormsModule
  ],
  templateUrl: './userprofile.html',
  styleUrl: './userprofile.css',
})
export class Userprofile implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private craftsmanService = inject(CraftsmanService);
  private orderService = inject(OrderService);

  readonly state$: Observable<UserProfileState> = this.authService.authChanged$.pipe(
    map(() => this.buildState()),
    startWith(this.buildState())
  );

  readonly canRate = signal<boolean>(false);
  ratingValue: number = 0;

  ngOnInit(): void {
    const state = this.buildState();
    const loggedInRole = this.authService.get_role();
    if (state.isNotTheOwner && loggedInRole === 'user' && state.user.craftsmanID) {
      this.checkCanRate(state.user.craftsmanID);
    }
  }

  onRateCraftsman(): void {
    const previewUser = this.userService.getPreviewUser();
    const craftsmanID = previewUser?.craftsmanID;

    if (!craftsmanID || !this.ratingValue) {
      return;
    }

    this.craftsmanService.rateCraftsman(craftsmanID, this.ratingValue)
      .subscribe({
        next: (response: RatingResponse) => {
          this.updateCachedUser(response);
          this.canRate.set(false);
        },
        error: (error: any) => {
          console.error('Error submitting rating:', error);
        }
      });
  }

  private checkCanRate(craftsmanID: number): void {
    const userId = Number(this.authService.get_id());
    if (!userId) return;

    this.orderService.getOrdersByCustomer(userId, 0, 100).subscribe({
      next: (response) => {
        const payload =
          (response as { data?: GetAllOrdersResponse }).data ??
          (response as unknown as GetAllOrdersResponse);
        const orders: OrderResponse[] = payload?.orders ?? [];
        const eligible = orders.some(
          (o) =>
            o.craftsman_id === craftsmanID &&
            o.status?.trim().toUpperCase() === 'SHIPPED' &&
            o.completion_date != null &&
            this.daysSinceDate(o.completion_date) >= 7
        );
        this.canRate.set(eligible);
      },
    });
  }

  private daysSinceDate(dateStr: string): number {
    const ms = Date.now() - new Date(dateStr).getTime();
    return ms / (1000 * 60 * 60 * 24);
  }

  private updateCachedUser(response: RatingResponse): void {
    const previewUser = this.userService.getPreviewUser();
    if (previewUser) {
      previewUser.rating = response.averageRating;
      previewUser.numberOfRatings = response.numberOfRatings;
      this.userService.setPreviewUser(previewUser);
    }
  }

  private buildState(): UserProfileState {
    const usernameParam = this.route.snapshot.paramMap.get('username');
    const userData = localStorage.getItem('userData');
    const loggedInUser = userData ? JSON.parse(userData) : null;

    const isNotTheOwner = Boolean(
      loggedInUser && usernameParam && loggedInUser.username !== usernameParam
    );
    const isGuestView = Boolean(
      usernameParam && loggedInUser?.username !== usernameParam
    );

    let user: User;
    let userRole = '';

    if (isGuestView) {
      user = this.userService.getPreviewUser() ?? new User();
    } else {
      userRole = this.authService.get_role();
      user = loggedInUser || new User();
    }

    return {
      user,
      isGuestView,
      userRole,
      isNotTheOwner,
    };
  }
}
