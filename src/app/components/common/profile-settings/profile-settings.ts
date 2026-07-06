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
import { CraftsmanService } from '../../../services/craftsman/craftsman-service';
import { FileService } from '../../../services/utils/file-service';
import { AuthService } from '../../../services/utils/auth-service';
import { RegexPatterns } from '../../../regexPatterns';
import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { Header } from "../header/header/header";
import { BehaviorSubject } from 'rxjs';

interface ProfileSettingsState {
  uploadingFile: boolean;
  fileUploadMessage: string;
  fileUploadError: string;
  passwordSubmitting: boolean;
  passwordSuccessMessage: string;
  passwordErrorMessage: string;
  userRole: string;
  dashboardLink: string;
  deletingAccount: boolean;
  deleteAccountError: string;
  biographySubmitting: boolean;
  biographySuccessMessage: string;
  biographyErrorMessage: string;
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
    TextareaModule,
    Header
],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
})
export class ProfileSettings {
  passwordForm!: FormGroup;
  biographyForm!: FormGroup;
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private craftsmanService = inject(CraftsmanService);
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

    const userData = localStorage.getItem('userData');
    const biography = userData ? JSON.parse(userData).biography ?? '' : '';
    this.biographyForm = this.fb.group({
      biography: [biography],
    });
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

    this.patchState({
      passwordErrorMessage: '',
      passwordSuccessMessage: '',
      passwordSubmitting: true,
    });

    const payload = {
      new_password: this.passwordForm.get('new_password')?.value,
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.patchState({
          passwordSubmitting: false,
          passwordSuccessMessage: 'Лозинка је успешно измењена.',
          passwordErrorMessage: '',
        });
        this.passwordForm.reset();
        this.authService.logout();
      },
      error: (err) => {
        this.patchState({
          passwordSubmitting: false,
          passwordErrorMessage: err?.error?.message || 'Дошло је до грешке при промени лозинке.',
        });
      },
    });
  }

  submitBiographyChange(): void {
    this.patchState({
      biographyErrorMessage: '',
      biographySuccessMessage: '',
      biographySubmitting: true,
    });

    const biography = this.biographyForm.get('biography')?.value ?? '';

    this.craftsmanService.setBiography(biography).subscribe({
      next: () => {
        this.patchState({
          biographySubmitting: false,
          biographySuccessMessage: 'Биографија је успешно измењена.',
        });

        const currentDataString = localStorage.getItem('userData') || '{}';
        const currentDataObject = JSON.parse(currentDataString);
        currentDataObject.biography = biography;
        localStorage.setItem('userData', JSON.stringify(currentDataObject));
      },
      error: (err) => {
        this.patchState({
          biographySubmitting: false,
          biographyErrorMessage: err?.error?.message || 'Дошло је до грешке при промени биографије.',
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
            fileUploadError: 'Грешка: Сервер није вратио URL слике.',
          });
          return;
        }

        const payload = {
          newProfilePicture: profilePictureUrl,
        };

        this.userService.setProfilePicture(payload).subscribe({
          next: () => {
            this.patchState({
              uploadingFile: false,
              fileUploadMessage: 'Профилна слика је успешно измењена.',
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
                err?.error?.message || 'Дошло је до грешке при промени профилне слике.',
            });
          },
        });
      },
      error: (err) => {
        this.patchState({
          uploadingFile: false,
          fileUploadError: err?.error?.message || 'Дошло је до грешке при уплоаду фајла.',
        });
      },
    });
  }

  onDeleteAccount() {
    this.patchState({
      deletingAccount: true,
      deleteAccountError: '',
    });

    this.userService.deleteAccount().subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.patchState({
          deletingAccount: false,
          deleteAccountError: err?.error?.message || 'Дошло је до грешке при брисању налога.',
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

    return {
      uploadingFile: false,
      fileUploadMessage: '',
      fileUploadError: '',
      passwordSubmitting: false,
      passwordSuccessMessage: '',
      passwordErrorMessage: '',
      userRole,
      dashboardLink,
      deletingAccount: false,
      deleteAccountError: '',
      biographySubmitting: false,
      biographySuccessMessage: '',
      biographyErrorMessage: '',
    };
  }
}
