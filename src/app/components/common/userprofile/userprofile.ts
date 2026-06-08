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
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user/user-service';

@Component({
  selector: 'app-userprofile',
  imports: [CommonModule, MenubarModule, ButtonModule, CardModule, ImageModule, UserActions, PublicHeader],
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

  user: User = new User();
  isGuestView = false;

  ngOnInit() {
    const usernameParam = this.route.snapshot.paramMap.get('username');

    if (usernameParam) {
      this.isGuestView = true;
      this.userService.getByUsername(usernameParam).subscribe({
        next: (response: any) => {
          const profileData = response?.data ?? response;
          if (profileData?.role === 'admin') {
            const currentId = this.authService.get_id();
            const currentRole = this.authService.get_role();
            if (currentRole !== 'admin' || String(currentId) !== String(profileData.id)) {
              this.router.navigate(['/']);
              return;
            }
          }
          this.user = profileData;
          console.log('User data loaded in Userprofile component:', this.user);
        },
        error: () => {
          this.router.navigate(['/']);
        },
      });
    } else {
      const userData = localStorage.getItem('userData');
      if (userData) {
        this.user = JSON.parse(userData);
      }
      console.log('User data loaded in Userprofile component:', this.user);
    }
  }
}

