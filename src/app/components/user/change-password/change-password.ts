import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { UserService } from '../../../services/user/user-service';
import { RegexPatterns } from '../../../regexPatterns';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface ChangePasswordState {
  submitting: boolean;
  successMessage: string;
  errorMessage: string;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordModule, ButtonModule, CardModule, MessageModule, InputTextModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  changeForm!: FormGroup;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  private stateSubject$ = new BehaviorSubject<ChangePasswordState>({
    submitting: false,
    successMessage: '',
    errorMessage: '',
  });

  readonly state$ = this.stateSubject$.asObservable();

  constructor() {
    this.initForm();
  }

  private initForm(): void {
    this.changeForm = this.fb.group({
      username: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.pattern(RegexPatterns.PASSWORD)]],
      confirm_password: ['', [Validators.required]],
    }, { validators: this.matchPasswords });
  }

  matchPasswords(group: FormGroup) {
    const a = group.get('new_password')?.value;
    const b = group.get('confirm_password')?.value;
    return a === b ? null : { passwordsMismatch: true };
  }

  submit(): void {
    this.stateSubject$.next({
      submitting: false,
      successMessage: '',
      errorMessage: '',
    });

    if (this.changeForm.invalid) return;

    this.stateSubject$.next({
      submitting: true,
      successMessage: '',
      errorMessage: '',
    });

    const payload = {
      username: this.changeForm.get('username')?.value,
      new_password: this.changeForm.get('new_password')?.value,
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.stateSubject$.next({
          submitting: false,
          successMessage: 'Lozinka je uspešno izmenjena.',
          errorMessage: '',
        });
        setTimeout(() => this.router.navigate(['']), 1200);
      },
      error: (err) => {
        this.stateSubject$.next({
          submitting: false,
          successMessage: '',
          errorMessage: err?.error?.message || 'Došlo je do greške pri promeni lozinke.',
        });
      },
    });
  }
}
