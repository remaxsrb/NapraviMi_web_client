import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { PublicHeader } from '../common/public-header/public-header';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarModule, ButtonModule, RouterOutlet, PublicHeader],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  homeMenuItems: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.homeMenuItems = [
      {
        label: 'Postani Zanatlija',
        icon: 'pi pi-list',
        routerLink: 'craftsman-apply',
      },
      {
        label: 'Postani korisnik',
        icon: 'pi pi-user-edit',
        routerLink: 'user-registration',
      },
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

