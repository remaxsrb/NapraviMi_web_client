import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { RegexPatterns } from '../../regexPatterns';
import { UserService } from '../../services/user/user-service';
import { AuthService } from '../../services/utils/auth-service';

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
  ],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class Signin implements OnInit {

  loginError: boolean = false;
  loginErrorMessage: string = '';

  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initLoginForm();
  }

  initLoginForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  submit(): void {
    this.loginError = false;
    this.loginErrorMessage = '';

    this.userService.login(this.loginForm.value).subscribe({
      next: (response) => {
        localStorage.setItem(this.authService.TOKEN_KEY, response.access_token);
        var userData = response.user
        const payload = this.authService.decode_token(response.access_token);
        const userRole = payload?.role;
        if (userRole === 'craftsman') {
          userData.rating = String(userData?.rating);
          userData.numberOfRatings = String(userData?.numberOfRatings);

        }
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('User role from token payload:', userRole);
        if (userRole === 'user') {
          this.router.navigate(['/user']);
        } else if (userRole === 'craftsman') {
          this.router.navigate(['/craftsman']);
        }
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
      return `Prijavljivanje nije uspelo. Status: ${error.status}.`;
    }

    return 'Došlo je do greške pri prijavljivanju. Pokušajte ponovo.';
  }
}
