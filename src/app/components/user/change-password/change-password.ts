import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { UserService } from '../../../services/user/user-service';
import { RegexPatterns } from '../../../regexPatterns';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PasswordModule, ButtonModule, CardModule, MessageModule, InputTextModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword implements OnInit {
  changeForm!: FormGroup;
  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    // Reset flow: do not require current password (signed-out use case)
    this.changeForm = this.fb.group({
      username: ['', [Validators.required]],
      new_password: ['', [Validators.required],  Validators.pattern(RegexPatterns.PASSWORD)],
      confirm_password: ['', [Validators.required]],
    }, { validators: this.matchPasswords });
  }

  matchPasswords(group: FormGroup) {
    const a = group.get('new_password')?.value;
    const b = group.get('confirm_password')?.value;
    return a === b ? null : { passwordsMismatch: true };
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.changeForm.invalid) return;

    this.submitting = true;
    const payload = {
      username: this.changeForm.get('username')?.value,
      new_password: this.changeForm.get('new_password')?.value,
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Lozinka je uspešno izmenjena.';
        setTimeout(() => this.router.navigate(['']), 1200);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Došlo je do greške pri promeni lozinke.';
      },
    });
  }
}
