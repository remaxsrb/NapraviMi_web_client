import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  PaymentErrorDetails,
  PaymentErrorResponse,
  ParsedPaymentError,
  UserAction,
} from '../../interfaces/payment';

export type { PaymentErrorDetails, PaymentErrorResponse, ParsedPaymentError, UserAction };

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
    title: 'Привремено недоступно',
    message: 'Систем за плаћање је привремено недоступан. Покушајте поново за неколико тренутака.',
    actions: ['retry', 'contact_support'],
    severity: 'warning',
  },
  PAYMENT_CIRCUIT_HALF_OPEN: {
    title: 'Опоравак система',
    message: 'Систем се опоравља. Покушајте поново за тренутак.',
    actions: ['retry'],
    severity: 'info',
  },
  PAYMENT_RESERVATION_FAILED_INSUFFICIENT_FUNDS: {
    title: 'Недовољно средстава',
    message: 'Нема довољно средстава на картици. Користите другу картицу или покушајте са више средстава.',
    actions: ['change_card', 'contact_support'],
    severity: 'error',
  },
  PAYMENT_RESERVATION_FAILED_CARD_DECLINED: {
    title: 'Картица одбијена',
    message: 'Издавач картице је одбио трансакцију. Проверите податке и покушајте поново.',
    actions: ['verify_card', 'change_card', 'contact_support'],
    severity: 'error',
  },
  PAYMENT_RESERVATION_FAILED_INVALID_CARD: {
    title: 'Неисправна картица',
    message: 'Подаци картице нису исправни. Проверите број картице и покушајте поново.',
    actions: ['verify_card', 'change_card'],
    severity: 'error',
  },
  PAYMENT_CAPTURE_FAILED: {
    title: 'Грешка при финализацији плаћања',
    message: 'Грешка при финализацији плаћања. Покушајте поново или контактирајте подршку.',
    actions: ['retry', 'contact_support'],
    severity: 'error',
  },
  PAYMENT_REFUND_FAILED: {
    title: 'Грешка при повраћају средстава',
    message: 'Повраћај средстава је неуспешан. Контактирајте подршку.',
    actions: ['contact_support'],
    severity: 'error',
  },
  PAYMENT_GATEWAY_ERROR: {
    title: 'Грешка система за плаћање',
    message: 'Привремена грешка. Покушајте поново касније.',
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
      userMessage: error.message || 'Дошло је до грешке. Покушајте поново.',
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
        label: 'Покушај поново',
        action: onRetry,
        primary: true,
      });
    }

    if (config.actions.includes('change_card') && onChangeCard) {
      error.actionItems.push({
        label: 'Користи другу картицу',
        action: onChangeCard,
        primary: !config.actions.includes('retry'),
      });
    }

    if (config.actions.includes('verify_card')) {
      error.actionItems.push({
        label: 'Проверите податке картице',
        action: () => {
          console.log('User should verify card details');
          onChangeCard?.();
        },
      });
    }

    if (config.actions.includes('contact_support') && onContactSupport) {
      error.actionItems.push({
        label: 'Контактирај подршку',
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
