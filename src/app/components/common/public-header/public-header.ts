import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterLink } from '@angular/router';
import { CRAFT_OPTIONS } from '../../../constants/craft-options';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, RouterLink],
  templateUrl: './public-header.html',
  styleUrl: './public-header.css',
})
export class PublicHeader {
  searchQuery = '';

  constructor(private router: Router) {}

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.router.navigate(['']);
      return;
    }
    const match = CRAFT_OPTIONS.find((c) =>
      c.keywords.some((kw) => kw.includes(q) || q.includes(kw)),
    );
    if (match) {
      this.router.navigate(['craftsmen'], { queryParams: { craft: match.value } });
    } else {
      this.router.navigate(['']);
    }
  }
}
