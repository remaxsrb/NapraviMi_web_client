import { Component, inject } from '@angular/core';
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
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

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
export class Userprofile {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private craftsmanService = inject(CraftsmanService);

  readonly state$: Observable<UserProfileState> = this.authService.authChanged$.pipe(
    map(() => this.buildState()),
    startWith(this.buildState())
  );

  onRateCraftsman(event: { value?: number }): void {
    const currentState = this.buildState();
    const rating = event.value;
    const craftsmanId = currentState.user.craftsmanId;

    if (!craftsmanId || rating === undefined) {
      return;
    }

    this.craftsmanService.rateCraftsman(craftsmanId, rating)
      .subscribe({
        next: (response: any) => {
          console.log('Rating submitted successfully:', response);
        },
        error: (error: any) => {
          console.error('Error submitting rating:', error);
        }
      });
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
