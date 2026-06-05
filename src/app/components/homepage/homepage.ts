import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink } from '@angular/router';
import { HomepageWelcome } from '../homepage-welcome/homepage-welcome';
import { CraftsmenOverview } from '../craftsmen-overview/craftsmen-overview';
import { CRAFT_OPTIONS } from '../../constants/craft-options';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, MenubarModule, ButtonModule, InputTextModule, RouterLink, HomepageWelcome, CraftsmenOverview],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  homeMenuItems: MenuItem[] = [];

  searchQuery = '';
  currentView: 'welcome' | 'craftsmen' = 'welcome';
  activeCraftFilter: string | null = null;

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
          this.activeCraftFilter = null;
          this.currentView = 'craftsmen';
          this.searchQuery = '';
        },
      },
    ];
  }

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.currentView = 'welcome';
      this.activeCraftFilter = null;
      return;
    }

    const match = CRAFT_OPTIONS.find((c) => c.keywords.some((kw) => kw.includes(q) || q.includes(kw)));
    if (match) {
      this.activeCraftFilter = match.value;
      this.currentView = 'craftsmen';
    } else {
      this.currentView = 'welcome';
      this.activeCraftFilter = null;
    }
  }
}

