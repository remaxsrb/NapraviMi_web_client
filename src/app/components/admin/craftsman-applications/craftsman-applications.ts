import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CraftsmanApplicationService } from '../../../services/craftsman-application/craftsman-application-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CraftsmanService } from '../../../services/craftsman/craftsman-service';
import { CraftService } from '../../../services/craft/craft-service';
import { CraftOption } from '../../../interfaces/craft-option';

interface ApiApplication {
  id: number;
  email: string;
  status: string;
  craft: string;
  created_at: string;
  resolved_at?: string;
}

interface StatusOption {
  label: string;
  value: string;
}

interface ApplicationRow {
  id: number;
  email: string;
  craft: string;
  craftLabel: string;
  status: string;
  newStatus: string;
  createdAt: Date;
  resolvedAt?: Date;
}

interface GetAllResponse {
  data: {
    craftsman_applications: ApiApplication[];
    total: number;
  };
}

@Component({
  selector: 'app-craftsman-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, SelectModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService, CraftsmanApplicationService, CraftsmanService],
  templateUrl: './craftsman-applications.html',
  styleUrl: './craftsman-applications.css',
})
export class CraftsmanApplications implements OnInit {
  applications: ApplicationRow[] = [];
  displayedApplications: ApplicationRow[] = [];
  first = 0;
  backendLimit = 5;
  totalRecords = 0;
  isLoading = false;
  private initialLazyLoadHandled = false;

  statusOptions: StatusOption[] = [
    { label: 'Odbij', value: 'rejected' },
    { label: 'Odobri', value: 'approved' },
  ];

  craftOptions: CraftOption[] = [];

  private craftsmanApplicationService = inject(CraftsmanApplicationService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private craftsmanService = inject(CraftsmanService);
  private craftService = inject(CraftService);
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.craftService.getCraftOptions().subscribe((options) => (this.craftOptions = options));
  }

  pageChange(event: any): void {
    const skip = event.first ?? 0;
    const rows = event.rows ?? this.backendLimit;

    if (!this.initialLazyLoadHandled) {
      this.initialLazyLoadHandled = true;
      setTimeout(() => this.loadPage(skip, rows));
      return;
    }

    setTimeout(() => this.loadPage(skip, rows));
  }

  private loadPage(skip: number, limit: number): void {
    this.isLoading = true;
    const requestData: any = { limit, skip };

    this.craftsmanApplicationService.all(requestData).subscribe({
      next: (response: GetAllResponse) => {
        this.applications = response.data.craftsman_applications.map((a) => this.mapApiApplicationToRow(a));
        this.displayedApplications = this.applications;
        this.first = skip;
        this.backendLimit = limit;
        this.totalRecords = response.data.total;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.applications = [];
        this.displayedApplications = [];
        this.totalRecords = 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private mapApiApplicationToRow(application: ApiApplication): ApplicationRow {
    return {
      id: application.id,
      email: application.email,
      craft: application.craft,
      craftLabel: this.craftOptions.find((c) => c.value === application.craft)?.label ?? application.craft,
      status: application.status,
      newStatus: application.status,
      createdAt: new Date(application.created_at),
      resolvedAt: application.resolved_at && !application.resolved_at.startsWith('0001-01-01') ? new Date(application.resolved_at) : undefined,
    };
  }

  onStatusChange(event: any, app: ApplicationRow): void {
    const newStatus = event.value;
    if (newStatus === app.status) {
      return;
    }

    const statusLabel = this.statusOptions.find((s) => s.value === newStatus)?.label ?? newStatus;

    this.confirmationService.confirm({
      message: `Da li ste sigurni da želite da <b>${statusLabel.toLowerCase()}</b> zahtev korisnika <b>${app.email}</b>?`,
      header: 'Potvrda promene statusa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Da',
      rejectLabel: 'Ne',
      accept: () => {
        if (newStatus === 'approved') {
          const requestData = {
            id: app.id,
          };
          this.craftsmanApplicationService.approveCA(requestData).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Uspeh', detail: `Zahtev odobren.` });
              this.loadPage(this.first, this.backendLimit);

              const craftsmanData = {
                email: app.email,
                craft: app.craft,
              };

              this.craftsmanService.createCraftsman(craftsmanData).subscribe({
                next: () => {
                  
                },
                error: () => {
                  this.messageService.add({ severity: 'error', summary: 'Greška', detail: `Došlo je do greške prilikom kreiranja zanatlije nakon odobrenja zahteva.` });
                },
              });

            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Greška', detail: `Došlo je do greške prilikom odobravanja zahteva.` });
              app.newStatus = app.status;
            },
          });
        } else if (newStatus === 'rejected') {
          const requestData = {
            id: app.id,
          };
          this.craftsmanApplicationService.rejectCA(requestData).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Uspeh', detail: `Zahtev odbijen.` });
              this.loadPage(this.first, this.backendLimit);
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Greška', detail: `Došlo je do greške prilikom odbijanja zahteva.` });
              app.newStatus = app.status;
            },
          });
        } 
      },
      reject: () => {
        app.newStatus = app.status;
      },
    });
  }
}
