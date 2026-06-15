import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
import { DividerModule } from 'primeng/divider';
import { Header } from "../header/header/header";
import { BehaviorSubject } from 'rxjs';

interface ProfileSettingsState {
  uploadingFile: boolean;
  fileUploadMessage: string;
  fileUploadError: string;
  passwordSubmitting: boolean;
  passwordSuccessMessage: string;
  passwordErrorMessage: string;
  username: string;
  userRole: string;
  dashboardLink: string;
  deletingAccount: boolean;
  deleteAccountError: string;
}

interface SelectedFilesEvent {
  files?: File[];
}

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
    DividerModule,
    Header
],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
})
export class ProfileSettings {
  passwordForm!: FormGroup;
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private fileService = inject(FileService);
  private authService = inject(AuthService);
  private router = inject(Router);

  private readonly stateSubject$ = new BehaviorSubject<ProfileSettingsState>(this.buildInitialState());
  readonly state$ = this.stateSubject$.asObservable();

  selectedFile: File | null = null;

  constructor() {
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
    if (this.passwordForm.invalid) {
      return;
    }

    const currentState = this.stateSubject$.value;
    this.patchState({
      passwordErrorMessage: '',
      passwordSuccessMessage: '',
      passwordSubmitting: true,
    });

    const payload = {
      username: currentState.username,
      new_password: this.passwordForm.get('new_password')?.value,
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.patchState({
          passwordSubmitting: false,
          passwordSuccessMessage: 'Lozinka je uspešno izmenjena.',
          passwordErrorMessage: '',
        });
        this.passwordForm.reset();
        this.authService.logout();
      },
      error: (err) => {
        this.patchState({
          passwordSubmitting: false,
          passwordErrorMessage: err?.error?.message || 'Došlo je do greške pri promeni lozinke.',
        });
      },
    });
  }

  onFileSelect(event: SelectedFilesEvent): void {
    this.selectedFile = event.files?.[0] ?? null;
  }

  onFileUpload(): void {
    const file = this.selectedFile;
    if (!file) {
      return;
    }

    const currentState = this.stateSubject$.value;

    this.patchState({
      uploadingFile: true,
      fileUploadError: '',
      fileUploadMessage: '',
    });

    this.fileService.uploadFile(file, 'avatar').subscribe({
      next: (response) => {
        const profilePictureUrl = response?.data?.url || response?.url || '';
        if (!profilePictureUrl) {
          this.patchState({
            uploadingFile: false,
            fileUploadError: 'Greška: Server nije vratio URL slike.',
          });
          return;
        }

        const payload = {
          username: currentState.username,
          newProfilePicture: profilePictureUrl,
        };

        this.userService.setProfilePicture(payload).subscribe({
          next: () => {
            this.patchState({
              uploadingFile: false,
              fileUploadMessage: 'Profilna slika je uspešno izmenjena.',
            });

            const currentDataString = localStorage.getItem('userData') || '{}';

            const currentDataObject = JSON.parse(currentDataString);

            currentDataObject.profilePicture = profilePictureUrl;

            localStorage.setItem('userData', JSON.stringify(currentDataObject));
          },
          error: (err) => {
            this.patchState({
              uploadingFile: false,
              fileUploadError:
                err?.error?.message || 'Došlo je do greške pri promeni profilne slike.',
            });
          },
        });
      },
      error: (err) => {
        this.patchState({
          uploadingFile: false,
          fileUploadError: err?.error?.message || 'Došlo je do greške pri uploadu fajla.',
        });
      },
    });
  }

  onDeleteAccount() {
    const currentState = this.stateSubject$.value;
    this.patchState({
      deletingAccount: true,
      deleteAccountError: '',
    });

    this.userService.deleteAccount(currentState.username).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.patchState({
          deletingAccount: false,
          deleteAccountError: err?.error?.message || 'Došlo je do greške pri brisanju naloga.',
        });
      },
    });
  }

  private patchState(patch: Partial<ProfileSettingsState>): void {
    this.stateSubject$.next({
      ...this.stateSubject$.value,
      ...patch,
    });
  }

  private buildInitialState(): ProfileSettingsState {
    const userRole = this.authService.get_role();
    const dashboardLink =
      userRole === 'admin' ? '/admin' : userRole === 'craftsman' ? '/craftsman' : '/user';

    const userData = localStorage.getItem('userData');
    const username = userData ? JSON.parse(userData).username ?? '' : '';

    return {
      uploadingFile: false,
      fileUploadMessage: '',
      fileUploadError: '',
      passwordSubmitting: false,
      passwordSuccessMessage: '',
      passwordErrorMessage: '',
      username,
      userRole,
      dashboardLink,
      deletingAccount: false,
      deleteAccountError: '',
    };
  }
}
