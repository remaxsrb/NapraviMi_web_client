import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { CraftOption } from '../../interfaces/craft-option';

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
export class CraftsmanApplication implements OnInit {
  craftOptions: CraftOption[] = [];

  applicationForm!: FormGroup;
  selectedResumeName = '';
  resumeFile?: File;
  statusMessage = '';
  statusSeverity: 'success' | 'error' | 'info' = 'info';
  messageText =
    'Molimo priložite svoj rezime u PDF formatu pre nego što pošaljete prijavu.<br/>Podržan je samo PDF format.' +
    '<br/><br/>' +
    'Svako od korisnika moze da se prijavi da postane zanatlija.' +
    '<br/> ' +
    'Nakon slanja prijave, naš tim će pregledati vaš rezime i kontaktirati vas putem emaila sa daljim informacijama o procesu odobrenja.';

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private caService: CraftsmanApplicationService,
    private craftService: CraftService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.craftService.getCraftOptions().subscribe((options) => (this.craftOptions = options));
  }

  private setStatus(severity: 'success' | 'error' | 'info', message: string): void {
    this.statusSeverity = severity;
    this.statusMessage = message;
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
      this.selectedResumeName = '';
      this.resumeFile = undefined;
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Molimo izaberite PDF datoteku za rezime.');
      this.selectedResumeName = '';
      this.resumeFile = undefined;
      return;
    }

    this.resumeFile = file;
    this.selectedResumeName = file.name;
  }

  onResumeRemoved(): void {
    this.resumeFile = undefined;
    this.selectedResumeName = '';
  }

  onSubmit(): void {
    this.fileService.uploadFile(this.resumeFile!, 'resume').subscribe({
      next: () => {
        const applicationData = {
          email: this.applicationForm.value.email,
          craft: this.applicationForm.value.craft,
        };

        this.caService.create(applicationData).subscribe({
          next: () => {
            this.applicationForm.reset();
            this.onResumeRemoved();
            this.setStatus('success', 'Prijava je uspešno kreirana. Pratite email za dalji postupak.');
            setTimeout(() => {
              this.statusMessage = '';
              
            }, 3000);
          },
          error: () => {
            this.setStatus('error', 'Došlo je do greške prilikom kreiranja prijave. Molimo pokušajte ponovo.');
          },
        });
      },
      error: () => {
        this.setStatus('error', 'Došlo je do greške prilikom otpremanja rezimea. Molimo pokušajte ponovo.');
      },
    });
  }
}
