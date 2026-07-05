import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, tap, switchMap } from 'rxjs/operators';
import { PaymentErrorHandler } from '../services/utils/payment-error-handler';
import { MessageService } from 'primeng/api';

/**
 * HTTP Interceptor that:
 * 1. Detects payment errors from structured responses
 * 2. Auto-retries transient errors with exponential backoff
 * 3. Logs errors for debugging/support
 * 4. Chains errors to components for UI handling
 */
@Injectable()
export class PaymentErrorInterceptor implements HttpInterceptor {
  private errorHandler = inject(PaymentErrorHandler);
  private messageService = inject(MessageService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Check if this is a payment error
        if (!this.errorHandler.isPaymentError(error)) {
          return throwError(() => error);
        }

        const parsedError = this.errorHandler.parsePaymentError(error);

        // Log error with metadata for support/debugging
        console.error('Payment Error Detected:', {
          metadata: this.errorHandler.getErrorMetadata(parsedError),
          originalRequest: {
            url: req.url,
            method: req.method,
          },
        });

        // Auto-retry if applicable
        if (this.errorHandler.shouldAutoRetry(parsedError, 0)) {
          console.log('Auto-retrying payment request:', {
            code: parsedError.code,
            delay: this.errorHandler.getRetryDelay(0),
          });

          return timer(this.errorHandler.getRetryDelay(0)).pipe(
            tap(() => {
              // Notify user that we're retrying
              this.messageService.add({
                severity: 'info',
                summary: 'Понављам захтев',
                detail: 'Покушавам поново Вашу трансакцију...',
                sticky: false,
                life: 3000,
              });
            }),
            switchMap(() => next.handle(req)),
            catchError((retryError) => {
              const retryParsed = this.errorHandler.parsePaymentError(retryError);
              return throwError(() => retryParsed);
            })
          );
        }

        return throwError(() => parsedError);
      })
    );
  }
}
