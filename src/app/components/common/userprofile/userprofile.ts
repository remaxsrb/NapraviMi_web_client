import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/utils/auth-service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { User } from '../../../models/user';
import { UserActions } from '../user-actions/user-actions';

@Component({
  selector: 'app-userprofile',
  imports: [CommonModule, MenubarModule, ButtonModule, CardModule, ImageModule, UserActions],
  templateUrl: './userprofile.html',
  styleUrl: './userprofile.css',
})
export class Userprofile implements OnInit {
  constructor(private authService: AuthService) {}

  user: User = new User();

  ngOnInit() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.user = JSON.parse(userData);
      
    }
    console.log('User data loaded in Userprofile component:', this.user);
  }
}
