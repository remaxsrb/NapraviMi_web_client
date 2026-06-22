import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ParsedPaymentError } from '../../../interfaces/payment';

/**
 * Payment Error Notification Component
 * Displays structured payment errors with action buttons and support reference info
 */
@Component({
  selector: 'app-payment-err-notification',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule],
  templateUrl: './payment-err-notification.html',
  styleUrl: './payment-err-notification.css',
})
export class PaymentErrNotification {
  private messageService = inject(MessageService);

  currentError = signal<ParsedPaymentError | null>(null);
  isVisible = signal(false);

  /**
   * Show payment error notification
   */
  showPaymentError(error: ParsedPaymentError, toastId: string = 'payment-error'): void {
    this.currentError.set(error);
    this.isVisible.set(true);

    this.messageService.clear(toastId);
    this.messageService.add({
      key: toastId,
      severity: this.mapSeverity(error.code),
      summary: this.getErrorTitle(error.code),
      detail: error.userMessage,
      sticky: true,
      data: error,
    });
  }

  /**
   * Clear error notification
   */
  clearError(toastId: string = 'payment-error'): void {
    this.currentError.set(null);
    this.isVisible.set(false);
    this.messageService.clear(toastId);
  }

  /**
   * Handle action button click
   */
  onActionClick(action: any, toastId: string): void {
    action.action?.();
    this.clearError(toastId);
  }

  private mapSeverity(
    code: string
  ): 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast' {
    if (code.includes('CIRCUIT')) return 'warn';
    if (code.includes('FAILED') || code.includes('DECLINED')) return 'error';
    return 'error';
  }

  private getErrorTitle(code: string): string {
    const titles: Record<string, string> = {
      PAYMENT_CIRCUIT_OPEN: 'Sistem privremeno nedostupan',
      PAYMENT_CIRCUIT_HALF_OPEN: 'Oporavak sistema',
      PAYMENT_RESERVATION_FAILED_INSUFFICIENT_FUNDS: 'Nedovoljno sredstava',
      PAYMENT_RESERVATION_FAILED_CARD_DECLINED: 'Kartica odbijena',
      PAYMENT_RESERVATION_FAILED_INVALID_CARD: 'Neispravna kartica',
      PAYMENT_CAPTURE_FAILED: 'Greška pri finalizaciji plaćanja',
      PAYMENT_REFUND_FAILED: 'Greška pri povraćaju sredstava',
      PAYMENT_GATEWAY_ERROR: 'Greška sistema za plaćanje',
    };
    return titles[code] || 'Greška pri plaćanju';
  }
}
