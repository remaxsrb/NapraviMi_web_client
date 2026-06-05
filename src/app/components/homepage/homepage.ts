import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CRAFT_OPTIONS } from '../../constants/craft-options';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarModule, ButtonModule, InputTextModule, RouterLink, RouterOutlet],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  homeMenuItems: MenuItem[] = [];
  searchQuery = '';

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
          this.searchQuery = '';
          this.router.navigate(['craftsmen']);
        },
      },
    ];
  }

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.router.navigate(['']);
      return;
    }

    const match = CRAFT_OPTIONS.find((c) => c.keywords.some((kw) => kw.includes(q) || q.includes(kw)));
    if (match) {
      this.router.navigate(['craftsmen'], { queryParams: { craft: match.value } });
    } else {
      this.router.navigate(['']);
    }
  }
}

