import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { RegexPatterns } from '../../regexPatterns';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user-service';
import { Header } from '../common/header/header/header';
import { BehaviorSubject } from 'rxjs';
import { TURNSTILE_SITE_KEY } from '../../env';

interface RegistrationState {
  submissionError: boolean;
  submissionErrorMessage: string;
}

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileRenderOptions): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare const turnstile: TurnstileApi | undefined;

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MessageModule,
    InputTextModule,
    PasswordModule,
    DatePickerModule,
    RadioButtonModule,
    ButtonModule,
    CardModule,
    Header,
  ],
  templateUrl: './user-registration.html',
  styleUrls: ['./user-registration.css'],
})
export class UserRegistration implements AfterViewInit, OnDestroy {
  signUpForm!: FormGroup;

  @ViewChild('turnstileContainer', { static: true })
  private turnstileContainer!: ElementRef<HTMLDivElement>;

  private turnstileWidgetId: string | null = null;
  private turnstileToken: string | null = null;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);

  private errorSubject$ = new BehaviorSubject<RegistrationState>({
    submissionError: false,
    submissionErrorMessage: '',
  });

  readonly state$ = this.errorSubject$.asObservable();

  constructor() {
    this.initSignUpForm();
  }

  ngAfterViewInit(): void {
    this.renderTurnstile();
  }

  ngOnDestroy(): void {
    if (typeof turnstile !== 'undefined' && this.turnstileWidgetId !== null) {
      turnstile.remove(this.turnstileWidgetId);
    }
  }

  initSignUpForm(): void {
    this.signUpForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.pattern(RegexPatterns.EMAIL)]],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.pattern(RegexPatterns.PASSWORD)]],
        passwordConfirm: ['', [Validators.required]],
        date_of_birth: ['', [Validators.required]],
        gender: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const passwordConfirm = formGroup.get('passwordConfirm')?.value;
    return password === passwordConfirm ? null : { passwordsMismatch: true };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  onRegisterClick(): void {
    this.errorSubject$.next({
      submissionError: false,
      submissionErrorMessage: '',
    });

    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    if (!this.turnstileToken) {
      this.errorSubject$.next({
        submissionError: true,
        submissionErrorMessage: 'Molimo potvrdite da niste robot.',
      });
      return;
    }

    this.submit(this.turnstileToken);
  }

  private renderTurnstile(): void {
    if (typeof turnstile === 'undefined') {
      // The Turnstile script is loaded with `defer`; retry until it is ready.
      setTimeout(() => this.renderTurnstile(), 300);
      return;
    }

    if (this.turnstileWidgetId !== null) {
      return;
    }

    this.turnstileWidgetId = turnstile.render(this.turnstileContainer.nativeElement, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => {
        this.turnstileToken = token;
      },
      'error-callback': () => {
        this.turnstileToken = null;
      },
      'expired-callback': () => {
        this.turnstileToken = null;
        this.resetTurnstile();
      },
    });
  }

  private resetTurnstile(): void {
    this.turnstileToken = null;
    if (typeof turnstile !== 'undefined' && this.turnstileWidgetId !== null) {
      turnstile.reset(this.turnstileWidgetId);
    }
  }

  submit(turnstileToken: string): void {
    const formValue = this.signUpForm.value;
    const userData = {
      ...formValue,
      date_of_birth: formValue.date_of_birth ? this.formatDate(formValue.date_of_birth) : null,
     turnstileToken,
    };

    this.userService.register(userData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.resetTurnstile();
        const errorMessage = this.getSignupErrorMessage(error);
        this.errorSubject$.next({
          submissionError: true,
          submissionErrorMessage: errorMessage,
        });
      },
    });
  }

  private getSignupErrorMessage(error: any): string {
    const { error: backendErrorMessage, message: backendMessage } = error?.error ?? {};
    const effectiveMessage = backendErrorMessage || backendMessage || error?.message;

    if (effectiveMessage) {
      return effectiveMessage;
    }

    if (error?.status) {
      return `Registracija nije uspela. Status: ${error.status}.`;
    }

    return 'Došlo je do greške pri registraciji. Pokušajte ponovo.';
  }
}
