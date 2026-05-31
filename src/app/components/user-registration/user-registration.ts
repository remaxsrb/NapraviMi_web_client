import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Message, MessageModule } from 'primeng/message';
import { RegexPatterns } from '../../regexPatterns';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user-service';

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
  ],
  templateUrl: './user-registration.html',
  styleUrls: ['./user-registration.css'],
})
export class UserRegistration {
  signUpForm!: FormGroup;
  submissionError: boolean = false;
  submissionErrorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {
    this.initSignUpForm();
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

  submit(): void {
    this.submissionError = false;
    this.submissionErrorMessage = '';

    const formValue = this.signUpForm.value;
    const userData = {
      ...formValue,
      date_of_birth: formValue.date_of_birth ? this.formatDate(formValue.date_of_birth) : null,
    };

    this.userService.register(userData).subscribe({
      next: () => {
        this.submissionError = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.submissionError = true;
        this.submissionErrorMessage = this.getSignupErrorMessage(error);
        this.cdr.detectChanges(); 
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
