# Client-Side Payment Error Handling Architecture

**Date**: June 22, 2026  
**Frontend**: Angular 21 with PrimeNG  
**Backend Integration**: Structured PaymentError responses (HTTP 402, 503, 502)

---

## Executive Summary

This document outlines the **client-side strategy** for consuming the backend's structured payment error responses. The goal is to provide users with:

1. **Clear, actionable error messages** in Serbian
2. **Smart retry logic** for transient errors
3. **Contextual action buttons** for next steps
4. **Support ticket traceability** for debugging

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ User Actions (Click Checkout, Accept Order, etc.)       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Angular Component (Cart, Payment, Orders)               │
│ • processPayment()                                       │
│ • acceptOrder()                                          │
│ • Sends HTTP request                                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ HTTP Client + PaymentErrorInterceptor                   │
│ • Catches HttpErrorResponse                             │
│ • Checks if payment error (structured response)         │
│ • Auto-retries for transient errors (503)              │
│ • Enriches error object with metadata                  │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    ✅ Success          ❌ Error (ParsedPaymentError)
    • Navigate          • Passed to component
    • Show toast        • Check retryable flag
                        • Enrich with actions
                        • Display to user
                        │
                        ▼
                ┌──────────────────────┐
                │ PaymentErrorHandler  │
                ├──────────────────────┤
                │ • isPaymentError()   │
                │ • parseError()       │
                │ • enrichWithActions()│
                │ • getRetryDelay()    │
                └──────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────┐
         │ PaymentErrorNotificationComponent │
         ├──────────────────────────────────┤
         │ Shows PrimeNG Toast with:         │
         │ • Error title                     │
         │ • User-friendly message          │
         │ • Error code (for support ref)    │
         │ • Action buttons (Retry,          │
         │   Change Card, Contact Support)   │
         └──────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
    Action Clicked            Auto-dismissed
    • Execute callback         after 10 seconds
    • Retry: retry payment
    • Change Card: redirect
    • Contact: open support
```

---

## Core Components

### 1. PaymentErrorHandler Service

**Purpose**: Centralized logic for detecting, parsing, and enriching payment errors

**Key Responsibilities**:
- Detect if error is payment-related (structured response format)
- Parse error details (code, reason, retryable, timestamp)
- Map codes to user-friendly Serbian messages
- Determine retry eligibility
- Calculate exponential backoff delays
- Prepare metadata for logging

**Key Methods**:

```typescript
isPaymentError(error: HttpErrorResponse): boolean
  → Returns true if error.error has details.code/reason/retryable

parsePaymentError(error: HttpErrorResponse): ParsedPaymentError
  → Extracts structured error into typed object

enrichErrorWithActions(
  error, 
  onRetry?, 
  onChangeCard?, 
  onContactSupport?
): ParsedPaymentError
  → Adds action buttons based on error type

shouldAutoRetry(error, attemptCount): boolean
  → True if transient error and < 3 attempts

getRetryDelay(attemptCount): number
  → Returns delay in ms: Math.min(1000 * 2^n, 10000)

getErrorMetadata(error): Record<string, any>
  → Returns loggable metadata for support tickets
```

### 2. PaymentErrorInterceptor

**Purpose**: Automatically handle payment errors at HTTP layer

**Behavior**:
- Intercepts all HTTP responses
- On error: Check if payment error
- If retryable (503 errors): Auto-retry with exponential backoff
- If not retryable (402 errors): Pass to component handler
- Log error metadata for debugging

**Auto-Retry Logic**:
- Only retries specific codes: CIRCUIT_OPEN, CIRCUIT_HALF_OPEN, CAPTURE_FAILED
- Only if `details.retryable === true`
- Max 3 attempts total
- Exponential backoff: 1s → 2s → 4s
- User sees "Ponavljam zahtev..." toast during retry

### 3. PaymentErrNotification Component

**Purpose**: Display structured error as styled PrimeNG Toast

**Features**:
- Shows error title + user message
- Displays error code/reason/timestamp (for support ref)
- Renders action buttons (Retry, Change Card, Contact Support)
- Color-coded severity (error=red, warning=yellow, info=blue)
- Auto-dismisses after 10 seconds OR on action click
- Supports multiple toasts (different payment attempts)

**Selector**: `app-payment-err-notification`

**Key Methods**:
- `showPaymentError(error, toastId?)` - Display error toast
- `clearError(toastId?)` - Dismiss error toast
- `onActionClick(action, toastId)` - Handle action button clicks

**Template**:
```
┌───────────────────────────────────────────┐
│ ⚠️  Error Title                           │ ← Severity icon
├───────────────────────────────────────────┤
│ User-friendly message...                  │
├───────────────────────────────────────────┤
│ Kod greške: PAYMENT_CIRCUIT_OPEN         │ ← For support
│ Razlog: circuit_open                      │
│ Vreme: 22.06.2026 10:30:00               │
├───────────────────────────────────────────┤
│ [✓ Retry] [Change Card] [Support]        │ ← Actions
└───────────────────────────────────────────┘
```

---

## Error Code to UX Mapping

### Transient Errors (HTTP 503) — RETRYABLE

| Backend Code | Backend Reason | Status | User Message | Actions | Auto-Retry |
|---|---|---|---|---|---|
| `PAYMENT_CIRCUIT_OPEN` | `circuit_open` | 503 | "Sistem je privremeno nedostupan. Pokušajte ponovo za nekoliko trenutaka." | Retry, Support | ✅ Yes (up to 3x) |
| `PAYMENT_CIRCUIT_HALF_OPEN` | `circuit_open` | 503 | "Sistem se oporavlja. Pokušajte ponovo za trenutak." | Retry, Support | ✅ Yes |
| `PAYMENT_CAPTURE_FAILED` | `gateway_unavailable` | 503 | "Greška pri finalizaciji. Pokušajte ponovo ili kontaktirajte podršku." | Retry, Support | ✅ Yes |
| `PAYMENT_REFUND_FAILED` | `gateway_unavailable` | 503 | "Greška pri povraćaju. Kontaktirajte podršku." | Support | ❌ No (manual only) |

**Severity**: ⚠️ Warning (Yellow toast)

### Authentication Errors (HTTP 402) — NOT RETRYABLE

| Backend Code | Backend Reason | Status | User Message | Actions |
|---|---|---|---|---|
| `PAYMENT_RESERVATION_FAILED` | `insufficient_funds` | 402 | "Nedovoljno sredstava. Koristite drugu karticu ili račun sa više sredstava." | **Change Card**, Support |
| `PAYMENT_RESERVATION_FAILED` | `card_declined` | 402 | "Plaćanje odbiјeno. Proverite podatke kartice i pokušajte ponovo." | **Verify Card**, Change Card, Support |
| `PAYMENT_RESERVATION_FAILED` | `invalid_card` | 402 | "Podaci kartice nisu ispravni. Proverite broj kartice i pokušajte ponovo." | **Verify Card**, Change Card |
| `PAYMENT_GATEWAY_ERROR` | `unknown` | 402 | "Greška sistema. Pokušajte sa drugom karticom ili kontaktirajte podršku." | Change Card, Support |

**Severity**: ❌ Error (Red toast)

### Gateway/Infrastructure Errors (HTTP 502) — NOT RETRYABLE

| Backend Code | Backend Reason | Status | User Message | Actions |
|---|---|---|---|---|
| `PAYMENT_GATEWAY_ERROR` | `timeout` | 502 | "Privremena greška. Pokušajte ponovo kasnije." | Support |
| `PAYMENT_GATEWAY_ERROR` | `network_error` | 502 | "Problem sa mrežnom vezom. Pokušajte ponovo." | Support |

**Severity**: ❌ Error (Red toast)

---

## User Workflows

### Workflow 1: Successful Payment
```
User → [Click Checkout] → API ✅ → Success Message → Navigate to Orders
                          ↓
                      (Order created)
```

### Workflow 2: Transient Error (Auto-Retry)
```
User → [Click Checkout] → API 503 → Interceptor detects transient
                                      ↓
                                    Auto-retry + "Ponavljam zahtev..." toast
                                      ↓
                                    API 200 ✅ → Navigate to Orders
                                      ✗ Still fails
                                      ↓
                                    Show error toast with [Retry] button
                                      ↓
                                    User clicks [Retry] → Manual retry
```

### Workflow 3: Card Declined (Non-Retryable)
```
User → [Click Checkout] → API 402 → Interceptor: not payment error format
                                      ↓
                                    Component catches error
                                      ↓
                                    Parse & enrich with actions
                                      ↓
                                    Show toast:
                                    "Kartica odbijena"
                                    [Koristi drugu karticu]
                                    [Kontaktiraj podršku]
                                      ↓
                                    User clicks [Change Card]
                                      → Opens payment method selector
                                    or [Support]
                                      → Opens support chat
```

### Workflow 4: Multiple Payment Attempts
```
Attempt 1: CIRCUIT_OPEN → Auto-retry
Attempt 2: CIRCUIT_OPEN → Auto-retry
Attempt 3: CIRCUIT_OPEN → Show toast + manual [Retry]
User waits...
Manual Retry: SUCCESS ✅
```

---

## Integration Points

### 1. In Component (Payment/Cart/Orders)

```typescript
// Inject handlers
private messageService = inject(MessageService);
private errorHandler = inject(PaymentErrorHandler);
private errorNotification = viewChild(PaymentErrorNotificationComponent);

// In action handler
processPayment(): void {
  this.cartService.checkout(payload).subscribe({
    next: (response) => {
      // Show success
    },
    error: (error) => {
      const parsed = this.errorHandler.parsePaymentError(error);
      const enriched = this.errorHandler.enrichErrorWithActions(
        parsed,
        () => this.processPayment(),      // Retry
        () => this.changeCard(),           // Different card
        () => this.contactSupport()        // Support
      );
      
      this.errorNotification.showPaymentError(enriched);
      this.logPaymentError(enriched);     // For support ticket
    }
  });
}
```

### 2. In app.config.ts

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PaymentErrorInterceptor,
      multi: true,
    },
    MessageService,
    PaymentErrorHandler,
  ],
};
```

### 3. In HTML Template

```html
<app-payment-err-notification #errorNotification></app-payment-err-notification>

<button 
  pButton 
  label="Završi plaćanje"
  [disabled]="isProcessing()"
  (click)="processPayment()"
/>
```

---

## Support & Logging

### Error Metadata Captured

```typescript
{
  code: "PAYMENT_CIRCUIT_OPEN",
  reason: "circuit_open",
  timestamp: "2026-06-22T10:30:00Z",
  retryable: true,
  httpStatus: 503,
  userAgent: "Mozilla/5.0...",
  url: "http://localhost:4200/checkout",
  userEmail: "user@example.com",
  cartTotal: 5000,
  attemptCount: 2
}
```

### Support Ticket Flow

1. User encounters payment error → Toast shows error code
2. User clicks [Kontaktiraj podršku] → Opens support chat/form
3. User provides error code from toast → e.g., "PAYMENT_CIRCUIT_OPEN"
4. Support team searches logs for that code + timestamp + user
5. Finds root cause (circuit breaker was open at that time)

### Suggested Support Messages

**For Users**:
- Include error code when contacting support
- Take screenshot of error message
- Provide order ID if available

**For Support Team**:
- Error code uniquely identifies problem type
- Timestamp correlates with backend logs
- Retryable flag indicates if user can self-recover
- User email enables targeted follow-up

---

## Advanced Features (Future)

### 1. Automatic Exponential Backoff

**Current**: Interceptor auto-retries (1s, 2s, 4s max)  
**Future**: Make configurable per error code

```typescript
const retryConfig = {
  PAYMENT_CIRCUIT_OPEN: { maxAttempts: 5, baseDelay: 500 },
  PAYMENT_CAPTURE_FAILED: { maxAttempts: 3, baseDelay: 1000 },
};
```

### 2. Error Analytics Dashboard

Track:
- Error frequency by code/reason
- Success rate after retry
- User retention after payment errors
- Most common error codes

### 3. Contextual Recovery

Show recovery suggestions based on error:
```
"Insufficient Funds"
├─ [Add payment method]
├─ [Check account balance] (link to bank)
└─ [Return to cart] (remove items to reduce total)
```

### 4. Circuit Breaker Awareness

Show user a "circuit breaker" indicator when gateway is degraded:
```
⚠️ Payment system is experiencing delays
Expected recovery: 2-5 minutes
Would you like to wait and retry, or try later?
```

### 5. Multi-Language Support (i18n)

Move hardcoded Serbian messages to i18n system:
```typescript
userMessage: this.translateService.instant(
  'payment.errors.' + error.code
)
```

---

## Testing Strategy

### Unit Tests

1. **PaymentErrorHandler**
   - `isPaymentError()` with various response formats
   - `parsePaymentError()` correctness
   - `enrichErrorWithActions()` action selection logic
   - `shouldAutoRetry()` decision logic

2. **PaymentErrorInterceptor**
   - Passes through non-payment errors
   - Detects payment errors correctly
   - Auto-retries transient errors
   - Stops retrying after max attempts

3. **PaymentErrorNotificationComponent**
   - Shows correct severity colors
   - Displays all action buttons
   - Dismisses on action click
   - Auto-dismisses after timeout

### Integration Tests

1. **End-to-end payment flow**
   - User clicks checkout
   - Component calls service
   - Interceptor catches 503 error
   - Auto-retries and succeeds
   - Success message shown

2. **Error toast displayed correctly**
   - Toast appears with correct message
   - Error code displayed
   - Action buttons clickable
   - Callbacks fire correctly

### E2E Tests (Cypress/Playwright)

1. **Payment failure scenarios**
   - Simulate 402 response → verify error toast
   - Simulate 503 response → verify auto-retry + user sees notification
   - Simulate 502 response → verify error displayed with support action

2. **User actions**
   - Click "Retry" button → payment resubmitted
   - Click "Change Card" → redirects to payment method selector
   - Click "Contact Support" → opens support dialog

---

## Deployment Checklist

- [ ] PaymentErrorHandler service tested
- [ ] PaymentErrorInterceptor configured in app.config.ts
- [ ] PaymentErrorNotificationComponent added to app root
- [ ] PrimeNG Toast/MessageService setup
- [ ] All components using error handler
- [ ] Error logging service integrated
- [ ] Support documentation updated with error codes
- [ ] User-facing help docs mention error handling
- [ ] Monitoring alerts configured for error rates

---

## Summary

This architecture provides:

✅ **User-Friendly**: Serbian messages, action buttons, clear guidance  
✅ **Resilient**: Auto-retry for transient errors, exponential backoff  
✅ **Debuggable**: Error codes, timestamps, detailed logging  
✅ **Maintainable**: Centralized error handling, single source of truth  
✅ **Extensible**: Easy to add new error codes and recovery actions  

The frontend now mirrors the backend's sophisticated error handling, providing users with a professional, trustworthy payment experience.
