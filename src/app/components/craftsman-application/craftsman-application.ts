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
import { Header } from '../common/header/header/header';
import { CraftsmanApplicationService } from '../../services/craftsman-application/craftsman-application-service';
import { CraftOption } from '../../interfaces/craft';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
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
    Header
],
  templateUrl: './craftsman-application.html',
  styleUrls: ['./craftsman-application.css'],
})
export class CraftsmanApplication {
  applicationForm!: FormGroup;
  resumeFile?: File;
  messageText =
    'Молимо приложите своју радну биографију у PDF формату пре него што пошаљете пријаву.<br/>Подржан је само PDF формат.' +
    '<br/><br/>' +
    'Свако од корисника може да се пријави да постане занатлија.' +
    '<br/> ' +
    'Након слања пријаве, наш тим ће прегледати ваш резиме и контактирати вас путем е-поште са даљим информацијама о процесу одобрења.';

  private fb = inject(FormBuilder);
  private fileService = inject(FileService);
  private caService = inject(CraftsmanApplicationService);
  private craftService = inject(CraftService);

  private statusSubject$ = new BehaviorSubject<{ message: string; severity: 'success' | 'error' | 'info' }>({
    message: '',
    severity: 'info',
  });

  private resumeNameSubject$ = new BehaviorSubject<string>('');

  readonly state$: Observable<ApplicationState> = combineLatest([
    this.craftService.getCraftOptions().pipe(startWith([] as CraftOption[])),
    this.resumeNameSubject$,
    this.statusSubject$,
  ]).pipe(
    map(([craftOptions, selectedResumeName, status]) => ({
      craftOptions,
      selectedResumeName,
      statusMessage: status.message,
      statusSeverity: status.severity,
    }))
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
      alert('Молимо изаберите PDF датотеку за резиме.');
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
        const resumeUrl = response?.url || '';

        const applicationData = {
          email: this.applicationForm.value.email,
          craft: this.applicationForm.value.craft,
          resume_url: resumeUrl,
        };

        this.caService.create(applicationData).subscribe({
          next: () => {
            this.applicationForm.reset();
            this.onResumeRemoved();
            this.setStatus('success', 'Пријава је успешно креирана. Пратите email за даљи поступак.');
            setTimeout(() => {
              this.setStatus('info', '');
            }, 3000);
          },
          error: () => {
            this.setStatus('error', 'Дошло је до грешке приликом креирања пријаве. Молимо покушајте поново.');
          },
        });
      },
      error: () => {
        this.setStatus('error', 'Дошло је до грешке при отпремању фајла. Молимо покушајте поново.');
      },
    });
  }
}
