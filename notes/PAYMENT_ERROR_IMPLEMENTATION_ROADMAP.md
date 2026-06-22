# Payment Error Handling Implementation Roadmap

**Status**: Ready for Implementation  
**Priority**: High (Payment reliability)  
**Estimated Effort**: 4-6 hours  

---

## Phase 1: Core Infrastructure (Estimated: 1-2 hours)

### ✅ Task 1.1: PaymentErrorHandler Service
**File**: `src/app/services/utils/payment-error-handler.ts`  
**Status**: ✅ COMPLETED  
**What it does**: Centralized error detection, parsing, and enrichment

**Key exports**:
- `PaymentErrorHandler` - Main service
- `ParsedPaymentError` - Type definition
- `PaymentErrorResponse` - Backend response format

**Usage**:
```typescript
const errorHandler = inject(PaymentErrorHandler);
const parsed = errorHandler.parsePaymentError(httpError);
const enriched = errorHandler.enrichErrorWithActions(parsed, onRetry, onChangeCard, onSupport);
```

---

### ✅ Task 1.2: PaymentErrorInterceptor
**File**: `src/app/interceptors/payment-error.interceptor.ts`  
**Status**: ✅ COMPLETED  
**What it does**: Auto-detects and retries transient payment errors

**Auto-Retry Logic**:
- Detects HTTP 503 + structured error response
- Retries up to 3 times with exponential backoff (1s → 2s → 4s)
- Shows "Ponavljam zahtev..." toast during retry
- Parses error into `ParsedPaymentError` before throwing

**Integration in app.config.ts**:
```typescript
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: PaymentErrorInterceptor,
    multi: true,
  },
  // ... other providers
]
```

---

### ✅ Task 1.3: PaymentErrNotification Component
**File**: `src/app/components/common/payment-err-notification/payment-err-notification.ts`  
**Status**: ✅ COMPLETED  
**What it does**: Displays error toast with action buttons

**Features**:
- Shows error title + message
- Displays error code/reason/timestamp for support reference
- Renders action buttons (Retry, Change Card, Contact Support)
- Auto-dismisses after 10 seconds or on action click
- Color-coded by severity (red for error, yellow for warning)

**Usage in template**:
```html
<app-payment-err-notification #errorNotification></app-payment-err-notification>
```

**Usage in component**:
```typescript
@ViewChild(PaymentErrNotification) errorNotification!: PaymentErrNotification;

// Show error
const enriched = this.errorHandler.enrichErrorWithActions(parsed, ...);
this.errorNotification?.showPaymentError(enriched);
```

---

## Phase 2: Service Integration (Estimated: 1-2 hours)

### ⏳ Task 2.1: Update CartService
**File**: `src/app/services/cart/cart-service.ts`  
**What to do**:
1. Inject `PaymentErrorHandler` (optional, for manual handling)
2. Catch errors in checkout methods
3. Log payment errors via `getErrorMetadata()`

**Changes**:
```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private errorHandler = inject(PaymentErrorHandler);
  private apiUrl = 'http://localhost:8080/api/carts';

  checkout(payload: CheckoutPayload): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/checkout`, payload)
      .pipe(
        catchError((error) => {
          // Interceptor will handle payment errors automatically
          // This is for logging/analytics if needed
          if (this.errorHandler.isPaymentError(error)) {
            const parsed = this.errorHandler.parsePaymentError(error);
            console.log('Checkout payment error:', parsed);
          }
          return throwError(() => error);
        })
      );
  }
}
```

**Affected components**: Any component that calls `cartService.checkout()`

---

### ⏳ Task 2.2: Update OrderService
**File**: `src/app/services/order/order-service.ts`  
**What to do**: Already uses standard error responses; verify it doesn't need special handling

**Current state**: Returns typed errors via standard HttpClient

---

### ⏳ Task 2.3: Update PaymentService (if exists)
**File**: `src/app/services/payment/payment-service.ts` (if exists)  
**What to do**: Similar to CartService - catch and log errors

---

## Phase 3: Component Integration (Estimated: 2-3 hours)

### ⏳ Task 3.1: Update OrderOverviewComponent
**File**: `src/app/components/common/order-overview/order-overview.ts`  
**Changes needed**:

1. **Add signal for payment error**:
```typescript
paymentError = signal<ParsedPaymentError | null>(null);
paymentErrorAttempt = signal(0);
```

2. **Inject services**:
```typescript
private errorHandler = inject(PaymentErrorHandler);
private messageService = inject(MessageService);
```

3. **Update action handlers** (onAccept, onReject, onDeliver):
```typescript
onAccept(orderId: number): void {
  const craftsman_id = this.currentUser.id; // from AuthService
  
  this.actionLoading.set(true);
  this.orderService
    .acceptOrder(orderId, craftsman_id)
    .pipe(finalize(() => this.actionLoading.set(false)))
    .subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Prihvaćeno',
          detail: 'Narudžbina je prihvaćena.',
        });
        this.loadOrders(this.currentPage());
      },
      error: (error) => {
        // Handle payment errors specially
        if (this.errorHandler.isPaymentError(error)) {
          const parsed = this.errorHandler.parsePaymentError(error);
          const enriched = this.errorHandler.enrichErrorWithActions(
            parsed,
            () => this.onAccept(orderId),  // Retry
            null,                           // No card change for orders
            () => this.contactSupport()     // Support
          );
          
          this.paymentError.set(enriched);
          this.showErrorNotification(enriched);
          this.logPaymentError(enriched);
        } else {
          // Regular error handling
          this.errorMessage.set(error.message || 'Greška pri prihvatanju narudžbine');
        }
      }
    });
}
```

4. **Add helper methods**:
```typescript
private showErrorNotification(error: ParsedPaymentError): void {
  // Access the notification component ref
  const notification = this.errorNotificationRef;
  notification?.showPaymentError(error);
}

private logPaymentError(error: ParsedPaymentError): void {
  console.error('Order action payment error:', {
    ...this.errorHandler.getErrorMetadata(error),
    orderId: this.currentOrder?.order_id,
    action: this.currentAction, // 'accept', 'reject', 'deliver'
  });
}

private contactSupport(): void {
  // Implement: open support chat/form
  console.log('Opening support channel...');
}
```

5. **Update HTML template**:
```html
<!-- Add notification component -->
<app-payment-error-notification #errorNotification></app-payment-error-notification>

<!-- Show inline error if needed -->
@if (paymentError()) {
  <div class="error-banner">
    Error: {{ paymentError().userMessage }}
  </div>
}
```

---

### ⏳ Task 3.2: Add PaymentErrorNotificationComponent to Root
**File**: `src/app/app.html` (or root component)  
**Changes**:
```html
<app-payment-error-notification></app-payment-error-notification>
<!-- Rest of app template -->
```

---

### ⏳ Task 3.3: Create Payment Checkout Component (if needed)
**File**: `src/app/components/common/payment-checkout/payment-checkout.ts`  
**What to do**: If you have a dedicated checkout component, wire up error handling similar to OrderOverview

---

## Phase 4: Configuration & Setup (Estimated: 30 min)

### ⏳ Task 4.1: Update app.config.ts
**File**: `src/app/app.config.ts`  
**Changes**:
```typescript
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { PaymentErrorInterceptor } from './interceptors/payment-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    
    // HTTP setup
    provideHttpClient(
      withInterceptors([...]),
      // withInterceptorsFromDi() if using class-based interceptors
    ),
    
    // Add interceptor for payment errors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PaymentErrorInterceptor,
      multi: true,
    },
    
    // PrimeNG
    MessageService,
    
    // Payment error handler
    PaymentErrorHandler,
  ],
};
```

---

### ⏳ Task 4.2: Verify PrimeNG Toast Setup
**File**: Wherever you import PrimeNG components  
**Check**: 
- ✅ ToastModule imported
- ✅ p-toast component in root template
- ✅ MessageService provided

**Example**:
```typescript
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  template: `
    <p-toast position="top-right"></p-toast>
    <router-outlet></router-outlet>
  `,
  imports: [ToastModule, RouterOutlet],
})
export class App {}
```

---

## Phase 5: Testing (Estimated: 1-2 hours)

### ⏳ Task 5.1: Unit Tests - PaymentErrorHandler
**File**: `src/app/services/utils/payment-error-handler.spec.ts`

**Test cases**:
```typescript
describe('PaymentErrorHandler', () => {
  it('should detect payment error response format', () => {
    const error = new HttpErrorResponse({
      error: {
        error: 'Circuit open',
        details: {
          code: 'PAYMENT_CIRCUIT_OPEN',
          reason: 'circuit_open',
          retryable: true,
          timestamp: '2026-06-22T10:30:00Z',
        },
      },
      status: 503,
    });
    
    expect(handler.isPaymentError(error)).toBe(true);
  });

  it('should parse payment error correctly', () => {
    // ... test parsePaymentError
  });

  it('should enrich error with correct action items', () => {
    // ... test enrichErrorWithActions
  });

  it('should determine auto-retry eligibility', () => {
    // ... test shouldAutoRetry
  });

  it('should calculate exponential backoff delays', () => {
    // ... test getRetryDelay
  });
});
```

---

### ⏳ Task 5.2: Integration Tests - OrderOverview Component
**File**: `src/app/components/common/order-overview/order-overview.spec.ts`

**Test cases**:
```typescript
describe('OrderOverview with Payment Errors', () => {
  it('should handle payment error on accept order action', () => {
    // Mock 402 payment error from orderService.acceptOrder
    // Verify error notification shows
    // Verify action buttons rendered
  });

  it('should auto-retry on 503 error', (done) => {
    // Mock 503 circuit open error
    // Verify auto-retry happens
    // Verify success on retry
    // done();
  });

  it('should disable action buttons during payment retry', () => {
    // Verify [disabled]="actionLoading()" prevents multiple clicks
  });
});
```

---

### ⏳ Task 5.3: E2E Tests (Cypress/Playwright)
**File**: `e2e/payment-error-flows.cy.ts`

**Test scenarios**:
```typescript
describe('Payment Error User Flows', () => {
  it('User sees error toast when checkout fails with 402', () => {
    // Intercept checkout API → return 402 with payment error
    // User clicks "Checkout"
    // Verify error toast appears
    // Verify error code displayed
  });

  it('User can retry payment by clicking Retry button', () => {
    // First attempt: 503 error
    // Verify auto-retry happens in background
    // If manual retry needed: click [Retry] button
    // Verify payment succeeds
  });

  it('User can change payment card on declined error', () => {
    // Checkout fails with 402 card_declined
    // Click [Koristi drugu karticu]
    // Verify redirected to card selector
  });
});
```

---

## Phase 6: Documentation & Deployment (Estimated: 30 min)

### ⏳ Task 6.1: User-Facing Help Documentation
**File**: Create `docs/payment-errors.md`
**Content**:
- What each error code means (in Serbian)
- What to do for each error
- How to contact support
- FAQ

---

### ⏳ Task 6.2: Support/Admin Documentation
**File**: Create `docs/payment-error-support.md`
**Content**:
- How to read error codes and traces
- Common error code patterns
- How to correlate with backend logs
- Troubleshooting guide

---

### ⏳ Task 6.3: Pre-Production Checklist

- [ ] All services updated with error handlers
- [ ] PaymentErrorInterceptor configured
- [ ] PaymentErrorNotificationComponent added to root
- [ ] OrderOverviewComponent tested with error scenarios
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] PrimeNG Toast positioned correctly
- [ ] Error messages translated to Serbian
- [ ] Support documentation complete
- [ ] Error logging configured
- [ ] Monitoring alerts set up

---

## Quick Integration Example

For a new payment flow (e.g., in a cart/checkout component):

```typescript
import { viewChild } from '@angular/core';
import { PaymentErrNotification } from '../components/common/payment-err-notification/payment-err-notification';

@Component({
  selector: 'app-checkout',
  template: `
    <app-payment-err-notification #errorNotification></app-payment-err-notification>
    
    <button (click)="checkout()">Završi plaćanje</button>
  `,
  imports: [PaymentErrNotification, ButtonModule]
})
export class CheckoutComponent {
  private cartService = inject(CartService);
  private errorHandler = inject(PaymentErrorHandler);
  errorNotification = viewChild(PaymentErrNotification);

  checkout(): void {
    this.cartService.checkout({ items: [] }).subscribe({
      next: (order) => console.log('Success', order),
      error: (error) => {
        if (this.errorHandler.isPaymentError(error)) {
          const parsed = this.errorHandler.parsePaymentError(error);
          const enriched = this.errorHandler.enrichErrorWithActions(
            parsed,
            () => this.checkout()
          );
          this.errorNotification()?.showPaymentError(enriched);
        }
      },
    });
  }
}
```

That's it! The interceptor handles retries automatically, and the notification component handles UI.

---

## Summary

**What was built**:
1. ✅ `PaymentErrorHandler` - Centralized error logic
2. ✅ `PaymentErrorInterceptor` - Auto-retry + error enrichment
3. ✅ `PaymentErrorNotificationComponent` - Toast UI with actions
4. ✅ Integration guide with examples
5. ✅ Architecture documentation

**What needs to be done**:
- [ ] Wire up PaymentErrorHandler into app.config.ts
- [ ] Add PaymentErrorNotificationComponent to root
- [ ] Update action handlers in components (OrderOverview, Cart, Payment)
- [ ] Write and run tests
- [ ] Deploy and monitor

**Timeline**: ~4-6 hours of focused development

**Risk Level**: Low (backward compatible, error handlers don't break existing functionality)

---

## Files Created/Modified

| File | Type | Status |
|------|------|--------|
| `src/app/services/utils/payment-error-handler.ts` | New | ✅ Ready |
| `src/app/components/common/payment-err-notification/payment-err-notification.ts` | New | ✅ Ready |
| `src/app/interceptors/payment-error.interceptor.ts` | New | ✅ Ready |
| `src/app/app.config.ts` | Modified | ⏳ Pending |
| `src/app/components/common/order-overview/order-overview.ts` | Modified | ⏳ Pending |
| `src/app/services/cart/cart-service.ts` | Modified | ⏳ Pending |
| `src/app/PAYMENT_ERROR_INTEGRATION_GUIDE.ts` | New (Docs) | ✅ Ready |
| `notes/CLIENT_PAYMENT_ERROR_ARCHITECTURE.md` | New (Docs) | ✅ Ready |
