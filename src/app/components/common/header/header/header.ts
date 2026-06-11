import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterLink } from '@angular/router';
import { CRAFT_OPTIONS } from '../../../../constants/craft-options';
import { AuthService } from '../../../../services/utils/auth-service';
import { UserActions } from '../../user-actions/user-actions';
import { User } from '../../../../models/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, RouterLink, UserActions],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  searchQuery = '';
  currentUser: User | undefined;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.is_LoggedIn();
  }

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
