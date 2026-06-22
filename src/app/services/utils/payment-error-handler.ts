import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Mirrors backend PaymentErrorDetails structure
 */
export interface PaymentErrorDetails {
  code: string;           // e.g., "PAYMENT_CIRCUIT_OPEN"
  reason: string;         // e.g., "circuit_open"
  retryable: boolean;
  timestamp: string;
}

export interface PaymentErrorResponse {
  error: string;          // User-friendly message from backend
  details: PaymentErrorDetails;
}

/**
 * Frontend representation of payment error
 */
export interface ParsedPaymentError {
  code: string;
  reason: string;
  retryable: boolean;
  timestamp: Date;
  userMessage: string;                    // From backend or fallback
  actionItems: UserAction[];              // What user should do
  isPaymentError: boolean;
  httpStatus: number;
  originalError?: any;
}

/**
 * Actionable steps for user
 */
export interface UserAction {
  label: string;          // "Retry Payment", "Try Different Card", etc.
  action: () => void;     // Callback function
  primary?: boolean;      // Highlight as primary action
}

/**
 * Error code to user action mapping
 */
const ERROR_ACTION_MAP: Record<string, {
  title: string;
  message: string;
  actions: string[];
  severity: 'error' | 'warning' | 'info';
}> = {
  PAYMENT_CIRCUIT_OPEN: {
    title: 'Privremeno nedostupno',
    message: 'Šištem za plaćanje je privremeno nedostupan. Pokušajte ponovo za nekoliko trenutaka.',
    actions: ['retry', 'contact_support'],
    severity: 'warning',
  },
  PAYMENT_CIRCUIT_HALF_OPEN: {
    title: 'Oporavak sistema',
    message: 'Sistem se oporavlja. Pokušajte ponovo za trenutak.',
    actions: ['retry'],
    severity: 'info',
  },
  PAYMENT_RESERVATION_FAILED_INSUFFICIENT_FUNDS: {
    title: 'Nedovoljno sredstava',
    message: 'Nema dovoljno sredstava na kartici. Koristite drugu karticu ili pokušajte sa više sredstava.',
    actions: ['change_card', 'contact_support'],
    severity: 'error',
  },
  PAYMENT_RESERVATION_FAILED_CARD_DECLINED: {
    title: 'Kartica odbijena',
    message: 'Izdavač kartice je odbio transakciju. Proverite podatke i pokušajte ponovo.',
    actions: ['verify_card', 'change_card', 'contact_support'],
    severity: 'error',
  },
  PAYMENT_RESERVATION_FAILED_INVALID_CARD: {
    title: 'Neispravna kartica',
    message: 'Podaci kartice nisu ispravni. Proverite broj kartice i pokušajte ponovo.',
    actions: ['verify_card', 'change_card'],
    severity: 'error',
  },
  PAYMENT_CAPTURE_FAILED: {
    title: 'Greška pri finalizaciji plaćanja',
    message: 'Greška pri finalizaciji plaćanja. Pokušajte ponovo ili kontaktirajte podršku.',
    actions: ['retry', 'contact_support'],
    severity: 'error',
  },
  PAYMENT_REFUND_FAILED: {
    title: 'Greška pri povraćaju sredstava',
    message: 'Povraćaj sredstava je neuspešan. Kontaktirajte podršku.',
    actions: ['contact_support'],
    severity: 'error',
  },
  PAYMENT_GATEWAY_ERROR: {
    title: 'Greška šišitema za plaćanje',
    message: 'Privremena greška. Pokušajte ponovo kasnije.',
    actions: ['retry', 'contact_support'],
    severity: 'error',
  },
};

@Injectable({
  providedIn: 'root',
})
export class PaymentErrorHandler {
  /**
   * Check if HTTP error is a payment error
   */
  isPaymentError(error: HttpErrorResponse): boolean {
    if (!error.error) return false;

    const body = error.error;
    return (
      body.details &&
      typeof body.details === 'object' &&
      body.details.code &&
      body.details.reason &&
      typeof body.details.retryable === 'boolean'
    );
  }

  /**
   * Parse HTTP error into structured format
   */
  parsePaymentError(error: HttpErrorResponse): ParsedPaymentError {
    if (this.isPaymentError(error)) {
      const response = error.error as PaymentErrorResponse;
      return {
        code: response.details.code,
        reason: response.details.reason,
        retryable: response.details.retryable,
        timestamp: new Date(response.details.timestamp),
        userMessage: response.error,
        actionItems: [],
        isPaymentError: true,
        httpStatus: error.status,
        originalError: error,
      };
    }

    // Fallback for non-payment errors
    return {
      code: 'UNKNOWN_ERROR',
      reason: 'unknown',
      retryable: false,
      timestamp: new Date(),
      userMessage: error.message || 'Došlo je do greške. Pokušajte ponovo.',
      actionItems: [],
      isPaymentError: false,
      httpStatus: error.status,
      originalError: error,
    };
  }

  /**
   * Build user-friendly error display with action items
   */
  enrichErrorWithActions(
    error: ParsedPaymentError,
    onRetry?: () => void,
    onChangeCard?: () => void,
    onContactSupport?: () => void
  ): ParsedPaymentError {
    const config = ERROR_ACTION_MAP[error.code] || ERROR_ACTION_MAP['PAYMENT_GATEWAY_ERROR'];

    error.actionItems = [];

    if (config.actions.includes('retry') && onRetry && error.retryable) {
      error.actionItems.push({
        label: 'Pokušaj ponovo',
        action: onRetry,
        primary: true,
      });
    }

    if (config.actions.includes('change_card') && onChangeCard) {
      error.actionItems.push({
        label: 'Koristi drugu karticu',
        action: onChangeCard,
        primary: !config.actions.includes('retry'),
      });
    }

    if (config.actions.includes('verify_card')) {
      error.actionItems.push({
        label: 'Proverite podatke kartice',
        action: () => {
          console.log('User should verify card details');
          onChangeCard?.();
        },
      });
    }

    if (config.actions.includes('contact_support') && onContactSupport) {
      error.actionItems.push({
        label: 'Kontaktiraj podršku',
        action: onContactSupport,
      });
    }

    return error;
  }

  /**
   * Get error metadata for logging/support
   */
  getErrorMetadata(error: ParsedPaymentError): Record<string, any> {
    return {
      code: error.code,
      reason: error.reason,
      timestamp: error.timestamp.toISOString(),
      retryable: error.retryable,
      httpStatus: error.httpStatus,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  /**
   * Should automatically retry?
   * Only for transient errors within retry limit
   */
  shouldAutoRetry(error: ParsedPaymentError, attemptCount: number = 0): boolean {
    const maxRetries = 3;
    if (attemptCount >= maxRetries) return false;

    const transientCodes = ['PAYMENT_CIRCUIT_OPEN', 'PAYMENT_CIRCUIT_HALF_OPEN', 'PAYMENT_CAPTURE_FAILED'];
    return error.retryable && transientCodes.includes(error.code);
  }

  /**
   * Exponential backoff delay for retry
   */
  getRetryDelay(attemptCount: number): number {
    return Math.min(1000 * Math.pow(2, attemptCount), 10000);
  }
}
