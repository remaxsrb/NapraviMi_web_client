import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UserService } from '../../../services/user/user-service';
import { FileService } from '../../../services/utils/file-service';
import { AuthService } from '../../../services/utils/auth-service';
import { RegexPatterns } from '../../../regexPatterns';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    MessageModule,
    InputTextModule,
    FileUploadModule,
    ProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
})
export class ProfileSettings implements OnInit {
  passwordForm!: FormGroup;
  uploadingFile = false;
  fileUploadMessage = '';
  fileUploadError = '';
  passwordSubmitting = false;
  passwordSuccessMessage = '';
  passwordErrorMessage = '';
  username: string = '';
  userRole: string = '';
  dashboardLink: string = '';

  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private fileService: FileService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.get_role();
    this.dashboardLink =
      this.userRole === 'admin' ? '/admin' : this.userRole === 'craftsman' ? '/craftsman' : '/user';

    const userData = localStorage.getItem('userData');
    if (userData) {
      this.username = JSON.parse(userData).username;
    }

    this.passwordForm = this.fb.group(
      {
        new_password: ['', [Validators.required, Validators.pattern(RegexPatterns.PASSWORD)]],
        confirm_password: ['', [Validators.required]],
      },
      { validators: this.matchPasswords },
    );
  }

  matchPasswords(group: FormGroup) {
    const a = group.get('new_password')?.value;
    const b = group.get('confirm_password')?.value;
    return a === b ? null : { passwordsMismatch: true };
  }

  submitPasswordChange(): void {
    this.passwordErrorMessage = '';
    this.passwordSuccessMessage = '';
    if (this.passwordForm.invalid) return;

    this.passwordSubmitting = true;
    const payload = {
      username: this.username,
      new_password: this.passwordForm.get('new_password')?.value,
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.passwordSubmitting = false;
        this.passwordSuccessMessage = 'Lozinka je uspešno izmenjena.';
        this.passwordForm.reset();
        this.authService.logout();
      },
      error: (err) => {
        this.passwordSubmitting = false;
        this.passwordErrorMessage =
          err?.error?.message || 'Došlo je do greške pri promeni lozinke.';
      },
    });
  }

  onFileSelect(event: any): void {
    this.selectedFile = event.files[0];
  }

  onFileUpload(): void {
    const file = this.selectedFile;
    if (!file) return;

    this.uploadingFile = true;
    this.fileUploadError = '';
    this.fileUploadMessage = '';

    this.fileService.uploadFile(file).subscribe({
      next: (response) => {
        const profilePictureUrl = response?.data?.url || response?.url || '';
        if (!profilePictureUrl) {
          this.uploadingFile = false;
          this.fileUploadError = 'Greška: Server nije vratio URL slike.';
          return;
        }

        const payload = {
          username: this.username,
          newProfilePicture: profilePictureUrl,
        };

        this.userService.setProfilePicture(payload).subscribe({
          next: () => {
            this.uploadingFile = false;
            this.fileUploadMessage = 'Profilna slika je uspešno izmenjena.';
            setTimeout(() => {
              this.fileUploadMessage = '';
            }, 3000);
          },
          error: (err) => {
            this.uploadingFile = false;
            this.fileUploadError =
              err?.error?.message || 'Došlo je do greške pri promeni profilne slike.';
          },
        });
      },
      error: (err) => {
        this.uploadingFile = false;
        this.fileUploadError = err?.error?.message || 'Došlo je do greške pri uploadu fajla.';
      },
    });
  }
}
