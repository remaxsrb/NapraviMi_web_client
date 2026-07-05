import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../../services/user/user-service';
import { AuthService } from '../../../services/utils/auth-service';
import { Header } from '../../common/header/header/header';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface AdminLoginState {
  loginError: boolean;
  loginErrorMessage: string;
}

@Component({
  selector: 'app-admin-login',
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
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  loginForm!: FormGroup;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  private errorSubject$ = new BehaviorSubject<AdminLoginState>({
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
        localStorage.setItem(this.authService.TOKEN_KEY, response.access_token);
        localStorage.setItem('userData', JSON.stringify(response.user));
        const payload = this.authService.decode_token(response.access_token);
        const userRole = payload?.role;

        if (userRole === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.errorSubject$.next({
            loginError: true,
            loginErrorMessage: 'Није дозвољен приступ. Само администратори могу да се пријаве овде.',
          });
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
    const effectiveMessage = backendErrorMessage || backendMessage || error?.message;

    if (effectiveMessage) {
      return effectiveMessage;
    }

    if (error?.status) {
      return `Пријављивање није успело. Status: ${error.status}.`;
    }

    return 'Дошло је до грешке при пријављивању. Покушајте поново.';
  }
}
