import { Component, OnInit } from '@angular/core';
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
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private craftsmanService: CraftsmanService
  ) {}

  user: User = new User();
  isGuestView = false;
  userRole = '';
  isNotTheOwner = false;
  

  ngOnInit() {
    const usernameParam = this.route.snapshot.paramMap.get('username');
    const userData = localStorage.getItem('userData');
    const loggedInUser = userData ? JSON.parse(userData) : null;

    this.isNotTheOwner = loggedInUser && loggedInUser.username !== usernameParam; 

    if (usernameParam && loggedInUser?.username !== usernameParam) {
      this.isGuestView = true;
      this.user = this.userService.getPreviewUser();
    } else {
      this.userRole = this.authService.get_role();
      if (!loggedInUser) return;
      this.user = loggedInUser;
    }
  }



onRateCraftsman(event: any): void {
  const rating = event.value;

  this.craftsmanService.rateCraftsman(this.user.craftsmanId!, rating)
    .subscribe({
      next: (response: any) => {
        console.log('Rating submitted successfully:', response);
      },
      error: (error: any) => {
        console.error('Error submitting rating:', error);
      }
    });
}

}
