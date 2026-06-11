import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Header } from '../common/header/header/header';
import { AuthService } from '../../services/utils/auth-service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarModule, ButtonModule, RouterOutlet, Header],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  homeMenuItems: MenuItem[] = [];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const role = this.authService.get_role();
    const isLoggedIn = this.authService.is_LoggedIn();

    this.homeMenuItems = [
      ...(!isLoggedIn || role === 'user' ? [{
        label: 'Postani Zanatlija',
        icon: 'pi pi-list',
        routerLink: 'craftsman-apply',
      }] : []),
      
      {
        label: 'Pregled zanatlija',
        icon: 'pi pi-users',
        command: () => {
          this.router.navigate(['craftsmen']);
        },
      },
    ];
  }
}

