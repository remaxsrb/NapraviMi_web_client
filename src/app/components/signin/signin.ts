import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../services/user/user-service';
import { AuthService } from '../../services/utils/auth-service';
import { Header } from '../common/header/header/header';
import { BehaviorSubject } from 'rxjs';

interface SigninState {
  loginError: boolean;
  loginErrorMessage: string;
}

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MessageModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    RouterLink,
    Header,
  ],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class Signin {
  loginForm!: FormGroup;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  private errorSubject$ = new BehaviorSubject<SigninState>({
    loginError: false,
    loginErrorMessage: '',
  });

  readonly state$ = this.errorSubject$.asObservable();

  constructor() {
    this.initLoginForm();
  }

  initLoginForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  submit(): void {
    this.errorSubject$.next({
      loginError: false,
      loginErrorMessage: '',
    });

    this.userService.login(this.loginForm.value).subscribe({
      next: (response) => {
        const payload = this.authService.decode_token(response.access_token);
        const userRole = payload?.role;
        const userData = response.user;
        if (userRole === 'craftsman') {
          userData.rating = String(userData?.rating);
          userData.numberOfRatings = String(userData?.numberOfRatings);
        }
        this.authService.setSession(response.access_token, userData);
        if (userRole === 'user') {
          this.router.navigate(['/user']);
        } else if (userRole === 'craftsman') {
          this.router.navigate(['/craftsman']);
        }
      },
      error: (error) => {
        const errorMessage = this.getLoginErrorMessage(error);
        this.errorSubject$.next({
          loginError: true,
          loginErrorMessage: errorMessage,
        });
      },
    });
  }

  private getLoginErrorMessage(error: any): string {
    const { error: backendErrorMessage, message: backendMessage } = error?.error ?? {};
    return backendErrorMessage || backendMessage || 'Грешка при пријави. Покушајте поново.';
  }
}
