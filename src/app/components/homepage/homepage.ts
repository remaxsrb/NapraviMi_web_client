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

export class Homepage {}
