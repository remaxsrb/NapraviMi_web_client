import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/utils/auth-service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { User } from '../../../models/user';
import { UserActions } from '../user-actions/user-actions';
import { PublicHeader } from '../public-header/public-header';
import { ProductsByCraftsman } from '../../products/products-by-craftsman/products-by-craftsman/products-by-craftsman';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user/user-service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-userprofile',
  imports: [
    CommonModule,
    MenubarModule,
    ButtonModule,
    CardModule,
    ImageModule,
    UserActions,
    PublicHeader,
    ProductsByCraftsman,
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
  ) {}

  craftsmanMenuItems: MenuItem[] = [];

  user: User = new User();  isGuestView = false;

  userRole = '';

  ngOnInit() {
    const usernameParam = this.route.snapshot.paramMap.get('username');

    if (usernameParam) {
      this.isGuestView = true;
      this.user = this.userService.getPreviewUser();
    } else {
      const userData = localStorage.getItem('userData');
      this.userRole = this.authService.get_role();
      if (!userData) return;
      this.user = JSON.parse(userData)

    }
  }
}
