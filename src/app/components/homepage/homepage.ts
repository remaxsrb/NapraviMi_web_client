import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from "@angular/router";
@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule, RouterLink],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})

export class Homepage {
  homeMenuItems: MenuItem[] = [
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
  ];
}
