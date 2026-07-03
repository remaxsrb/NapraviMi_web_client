import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { CraftOption } from '../../../interfaces/craft';
import { ApiApplication, ApplicationRow, GetApplicationsResponse, StatusChangeEvent, StatusOption } from '../../../interfaces/craftsman-application';
import { LazyLoadEvent, PaginationEvent } from '../../../interfaces/pagination';
import { BehaviorSubject, combineLatest, EMPTY, Observable } from 'rxjs';
import { map, switchMap, startWith, catchError } from 'rxjs/operators';

interface CraftsmanApplicationsState {
  applications: ApplicationRow[];
  craftOptions: CraftOption[];
  first: number;
  rows: number;
  totalRecords: number;
  isLoading: boolean;
}

@Component({
  selector: 'app-craftsman-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, SelectModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService, CraftsmanApplicationService, CraftsmanService],
  templateUrl: './craftsman-applications.html',
  styleUrl: './craftsman-applications.css',
})
export class CraftsmanApplications {
  statusOptions: StatusOption[] = [
    { label: 'Odbij', value: 'rejected' },
    { label: 'Odobri', value: 'approved' },
  ];

  private craftsmanApplicationService = inject(CraftsmanApplicationService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private craftsmanService = inject(CraftsmanService);
  private craftService = inject(CraftService);

  private paginationSubject$ = new BehaviorSubject<PaginationEvent>({
    first: 0,
    rows: 5,
  });

  readonly state$: Observable<CraftsmanApplicationsState> = combineLatest([
    this.craftService.getCraftOptions(),
    this.paginationSubject$,
  ]).pipe(
    switchMap(([craftOptions, pagination]) =>
      this.craftsmanApplicationService
        .all({ limit: pagination.rows, skip: pagination.first })
        .pipe(
          map((response: GetApplicationsResponse) => ({
            applications: response.data.craftsman_applications.map((a) =>
              this.mapApiApplicationToRow(a, craftOptions)
            ),
            craftOptions,
            first: pagination.first,
            rows: pagination.rows,
            totalRecords: response.data.total,
            isLoading: false,
          })),
          startWith({
            applications: [],
            craftOptions,
            first: pagination.first,
            rows: pagination.rows,
            totalRecords: 0,
            isLoading: true,
          }),
          catchError(() =>
            EMPTY.pipe(
              startWith({
                applications: [],
                craftOptions,
                first: pagination.first,
                rows: pagination.rows,
                totalRecords: 0,
                isLoading: false,
              })
            )
          )
        )
    ),
    startWith({
      applications: [],
      craftOptions: [],
      first: 0,
      rows: 5,
      totalRecords: 0,
      isLoading: true,
    })
  );

  pageChange(event: LazyLoadEvent): void {
    this.paginationSubject$.next({
      first: event.first ?? 0,
      rows: event.rows ?? this.paginationSubject$.value.rows,
    });
  }

  private mapApiApplicationToRow(application: ApiApplication, craftOptions: CraftOption[]): ApplicationRow {
    return {
      id: application.id,
      email: application.email,
      craft: application.craft,
      craftLabel: craftOptions.find((c) => c.value === application.craft)?.label ?? application.craft,
      status: application.status,
      newStatus: application.status,
      createdAt: new Date(application.created_at),
      resolvedAt:
        application.resolved_at && !application.resolved_at.startsWith('0001-01-01')
          ? new Date(application.resolved_at)
          : undefined,
      resumeUrl: application.resume_url,
    };
  }

  openResume(app: ApplicationRow): void {
    if (!app.resumeUrl) return;
    window.open(app.resumeUrl, '_blank', 'noopener,noreferrer');
  }

  onStatusChange(event: StatusChangeEvent, app: ApplicationRow): void {
    const newStatus = event.value ?? app.status;
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
          const requestData = { id: app.id };
          this.craftsmanApplicationService.approveCA(requestData).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Uspeh',
                detail: `Zahtev odobren.`,
              });
              this.refreshPage();

              const craftsmanData = {
                email: app.email,
                craft: app.craft,
              };

              this.craftsmanService.createCraftsman(craftsmanData).subscribe({
                next: () => {},
                error: () => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Greška',
                    detail: `Došlo je do greške prilikom kreiranja zanatlije nakon odobrenja zahteva.`,
                  });
                },
              });
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Greška',
                detail: `Došlo je do greške prilikom odobravanja zahteva.`,
              });
              app.newStatus = app.status;
            },
          });
        } else if (newStatus === 'rejected') {
          const requestData = { id: app.id };
          this.craftsmanApplicationService.rejectCA(requestData).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Uspeh',
                detail: `Zahtev odbijen.`,
              });
              this.refreshPage();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Greška',
                detail: `Došlo je do greške prilikom odbijanja zahteva.`,
              });
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

  private refreshPage(): void {
    const currentPagination = this.paginationSubject$.value;
    this.paginationSubject$.next(currentPagination);
  }
}
