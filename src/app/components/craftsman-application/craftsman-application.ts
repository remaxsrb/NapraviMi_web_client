import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CraftService } from '../../services/craft/craft-service';
import { FileService } from '../../services/utils/file-service';
import { UserService } from '../../services/user/user-service';
import { RouterLink } from "@angular/router";
import { CraftsmanApplicationService } from '../../services/craftsman-application/craftsman-application-service';
import { CraftOption } from '../../interfaces/craft';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface ApplicationState {
  craftOptions: CraftOption[];
  selectedResumeName: string;
  statusMessage: string;
  statusSeverity: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-craftsman-application',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    FileUploadModule,
    MessageModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    RouterLink
],
  templateUrl: './craftsman-application.html',
  styleUrls: ['./craftsman-application.css'],
})
export class CraftsmanApplication {
  applicationForm!: FormGroup;
  resumeFile?: File;
  messageText =
    'Molimo priložite svoj rezime u PDF formatu pre nego što pošaljete prijavu.<br/>Podržan je samo PDF format.' +
    '<br/><br/>' +
    'Svako od korisnika moze da se prijavi da postane zanatlija.' +
    '<br/> ' +
    'Nakon slanja prijave, naš tim će pregledati vaš rezime i kontaktirati vas putem emaila sa daljim informacijama o procesu odobrenja.';

  private fb = inject(FormBuilder);
  private fileService = inject(FileService);
  private caService = inject(CraftsmanApplicationService);
  private craftService = inject(CraftService);

  private statusSubject$ = new BehaviorSubject<{ message: string; severity: 'success' | 'error' | 'info' }>({
    message: '',
    severity: 'info',
  });

  private resumeNameSubject$ = new BehaviorSubject<string>('');

  readonly state$: Observable<ApplicationState> = this.craftService.getCraftOptions().pipe(
    map((craftOptions) => ({
      craftOptions,
      selectedResumeName: this.resumeNameSubject$.value,
      statusMessage: this.statusSubject$.value.message,
      statusSeverity: this.statusSubject$.value.severity,
    })),
    startWith({
      craftOptions: [],
      selectedResumeName: '',
      statusMessage: '',
      statusSeverity: 'info' as const,
    })
  );

  constructor() {
    this.initForm();
  }

  private setStatus(severity: 'success' | 'error' | 'info', message: string): void {
    this.statusSubject$.next({ severity, message });
  }

  initForm(): void {
    this.applicationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      craft: [null, Validators.required],
    });
  }

  onResumeSelected(event: any): void {
    const file = event?.files?.[0] as File | undefined;
    if (!file) {
      this.resumeNameSubject$.next('');
      this.resumeFile = undefined;
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Molimo izaberite PDF datoteku za rezime.');
      this.resumeNameSubject$.next('');
      this.resumeFile = undefined;
      return;
    }

    this.resumeFile = file;
    this.resumeNameSubject$.next(file.name);
  }

  onResumeRemoved(): void {
    this.resumeFile = undefined;
    this.resumeNameSubject$.next('');
  }

  onSubmit(): void {
    this.fileService.uploadFile(this.resumeFile!, 'resume').subscribe({
      next: (response) => {
        const resumeUrl = response?.url || response?.url || '';

        const applicationData = {
          email: this.applicationForm.value.email,
          craft: this.applicationForm.value.craft,
          resume_url: resumeUrl,
        };

        this.caService.create(applicationData).subscribe({
          next: () => {
            this.applicationForm.reset();
            this.onResumeRemoved();
            this.setStatus('success', 'Prijava je uspešno kreirana. Pratite email za dalji postupak.');
            setTimeout(() => {
              this.setStatus('info', '');
            }, 3000);
          },
          error: () => {
            this.setStatus('error', 'Došlo je do greške prilikom kreiranja prijave. Molimo pokušajte ponovo.');
          },
        });
      },
      error: () => {
        this.setStatus('error', 'Došlo je do greške pri otpremanju fajla. Molimo pokušajte ponovo.');
      },
    });
  }
}
