# Quick Integration Guide: PaymentErrNotification Component

**Status**: ✅ Component Ready to Use  
**Location**: `src/app/components/common/payment-err-notification/`  
**Standalone**: Yes  

---

## Setup: 3 Simple Steps

### Step 1: Register Interceptor in `app.config.ts`

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { PaymentErrorInterceptor } from './interceptors/payment-error.interceptor';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... existing providers
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PaymentErrorInterceptor,
      multi: true,
    },
    MessageService,  // Required for PrimeNG Toast
  ],
};
```

### Step 2: Add Component to Your Template

```html
<app-payment-err-notification #errorNotification></app-payment-err-notification>

<button (click)="checkout()">Završi plaćanje</button>
```

### Step 3: Handle Errors in Your Component

```typescript
import { inject, viewChild } from '@angular/core';
import { PaymentErrNotification } from '../common/payment-err-notification/payment-err-notification';
import { PaymentErrorHandler } from '../services/utils/payment-error-handler';

@Component({
  imports: [PaymentErrNotification, ...],
})
export class CheckoutComponent {
  private cartService = inject(CartService);
  private errorHandler = inject(PaymentErrorHandler);
  errorNotification = viewChild(PaymentErrNotification);

  checkout(): void {
    this.cartService.checkout(payload).subscribe({
      next: (order) => {
        console.log('Success!', order);
      },
      error: (error) => {
        // The interceptor auto-handles transient 503 errors (retries)
        // For remaining errors, parse and display:
        
        if (this.errorHandler.isPaymentError(error)) {
          const parsed = this.errorHandler.parsePaymentError(error);
          
          // Enrich with action callbacks
          const enriched = this.errorHandler.enrichErrorWithActions(
            parsed,
            () => this.checkout(),           // Retry
            () => this.changeCard(),          // Change payment method
            () => this.contactSupport()       // Contact support
          );
          
          // Show toast with actions
          this.errorNotification()?.showPaymentError(enriched);
        }
      },
    });
  }

  private changeCard(): void {
    // Navigate to payment methods, open dialog, etc.
  }

  private contactSupport(): void {
    // Open support chat or form
  }
}
```

---

## Key Components

### PaymentErrorHandler Service
**Purpose**: Parse and enrich payment errors  
**Key Methods**:
- `isPaymentError(error)` - Check if error is structured payment error
- `parsePaymentError(error)` - Convert to `ParsedPaymentError`
- `enrichErrorWithActions(...)` - Add action buttons
- `shouldAutoRetry(error)` - Determine if retryable
- `getRetryDelay(attemptCount)` - Calculate backoff delay

### PaymentErrorInterceptor
**Purpose**: Auto-retry transient errors + parse errors  
**Behavior**:
- Auto-detects HTTP 503 + structured error format
- Auto-retries up to 3 times with exponential backoff
- Shows "Ponavljam zahtev..." toast during retry
- Parses errors before passing to components

### PaymentErrNotification Component
**Purpose**: Display error toast with action buttons  
**Key Methods**:
- `showPaymentError(error, toastId?)` - Show toast
- `clearError(toastId?)` - Dismiss toast

---

## Error Display Examples

### Transient Error (503 - Circuit Open)
```
┌─────────────────────────────────────────┐
│ ⚠️ Sistem privremeno nedostupan       │
│ Sistem se oporavlja. Pokušajte ponovo  │
│ za nekoliko trenutaka.                  │
│                                         │
│ Kod greške: PAYMENT_CIRCUIT_OPEN       │ ← For support ref
│ Razlog: circuit_open                    │
│ Vreme: 22.06.2026 10:30:00             │
│                                         │
│ Može se pokušati ponovo                 │ ← Auto-retry flag
│                                         │
│ [✓ Pokušaj ponovo] [Kontaktiraj podršku]
└─────────────────────────────────────────┘
```

### Card Declined (402)
```
┌────────────────────────────────────────┐
│ ❌ Kartica odbijena                    │
│ Izdavač kartice je odbio transakciju.  │
│ Proverite podatke i pokušajte ponovo.  │
│                                        │
│ Kod greške: PAYMENT_RESERVATION_FAILED│
│ Razlog: card_declined                  │
│ Vreme: 22.06.2026 10:30:05            │
│                                        │
│ [✓ Koristi drugu karticu]              │
│ [Proverite karticu]                    │
│ [Kontaktiraj podršku]                  │
└────────────────────────────────────────┘
```

---

## Error Flow Diagram

```
User clicks "Završi plaćanje"
         ↓
    HTTP Request
         ↓
    Server Response
         ↓
   [Interceptor Catches]
         ↓
   Is it payment error? 
    /           \
  Yes           No
   |             |
   |          Pass through
   |         to component
   |
   Is 503 + retryable?
    /           \
  Yes           No
   |             |
Auto-retry    Parse & Enrich
with toast       with actions
   |             |
   |          Show Toast
   |          [Action Buttons]
   |
Success? Fail?
  |        |
Success  Show Toast
         [Retry], [Change Card], [Support]
```

---

## Common Integration Patterns

### Pattern 1: Simple Checkout Form

```typescript
@Component({
  selector: 'app-simple-checkout',
  template: `
    <app-payment-err-notification #err></app-payment-err-notification>
    
    <form>
      <input [(ngModel)]="amount" placeholder="Amount">
      <button (click)="pay()">Pay</button>
    </form>
  `,
  imports: [PaymentErrNotification, FormsModule]
})
export class SimpleCheckout {
  amount = 5000;
  
  private cartService = inject(CartService);
  private errorHandler = inject(PaymentErrorHandler);
  err = viewChild(PaymentErrNotification);

  pay(): void {
    this.cartService.checkout({ amount: this.amount }).subscribe({
      next: () => console.log('✅ Success'),
      error: (err) => {
        const parsed = this.errorHandler.parsePaymentError(err);
        const enriched = this.errorHandler.enrichErrorWithActions(
          parsed,
          () => this.pay()
        );
        this.err()?.showPaymentError(enriched);
      }
    });
  }
}
```

### Pattern 2: With Order Actions (OrderOverview)

```typescript
onAccept(orderId: number): void {
  this.orderService.acceptOrder(orderId, this.craftsman_id).subscribe({
    next: () => this.loadOrders(),
    error: (error) => {
      if (this.errorHandler.isPaymentError(error)) {
        const parsed = this.errorHandler.parsePaymentError(error);
        const enriched = this.errorHandler.enrichErrorWithActions(
          parsed,
          () => this.onAccept(orderId),  // Retry same order
          null,
          () => this.contactSupport()
        );
        this.errorNotification()?.showPaymentError(enriched);
      }
    }
  });
}
```

---

## Testing the Integration

### Manual Test - Success Flow
1. Add valid payment info
2. Click checkout
3. Verify success message
4. Verify order appears in list

### Manual Test - Transient Error (503)
1. Mock API to return 503 + CIRCUIT_OPEN error
2. Click checkout
3. Verify toast shows "Ponavljam zahtev..."
4. Verify auto-retry happens after 1s
5. On success → order created
6. On failure → "Pokušaj ponovo" button appears

### Manual Test - Card Declined (402)
1. Mock API to return 402 + CARD_DECLINED error
2. Click checkout
3. Verify toast shows with error details
4. Verify action buttons: "Change Card", "Support"
5. Click "Change Card" → navigates to payment methods

---

## Troubleshooting

### Toast Not Appearing?
- Check `MessageService` is provided in `app.config.ts`
- Check `app-payment-err-notification` is in template
- Check browser console for errors

### Auto-Retry Not Working?
- Verify `PaymentErrorInterceptor` is registered in `app.config.ts`
- Check network tab - should see 503 response
- Check browser console for "Auto-retrying" log

### Wrong Error Message?
- Check error code matches one in `ERROR_ACTION_MAP` 
- Fallback goes to `PAYMENT_GATEWAY_ERROR` if not found
- Can add new error codes to the map in `payment-error-handler.ts`

### Component Not Found?
- Verify import path: `from '../common/payment-err-notification/payment-err-notification'`
- Verify component is in `imports: [...]` array
- Check component selector is `app-payment-err-notification`

---

## Files Overview

| File | Purpose |
|------|---------|
| `payment-error-handler.ts` | Service for parsing/enriching errors |
| `payment-error.interceptor.ts` | HTTP interceptor for auto-retry |
| `payment-err-notification.ts` | Component for toast UI |
| `payment-err-notification.html` | Toast template with actions |
| `payment-err-notification.css` | Toast styling |

---

## Next Steps

1. ✅ Update `app.config.ts` with interceptor registration
2. ✅ Add component to root template or specific pages
3. ✅ Update action handlers in components (checkout, orders, etc.)
4. ✅ Test with mock payment errors
5. ✅ Deploy and monitor error rates

---

## Support

For questions or issues with payment error handling:
1. Check error code in toast (e.g., `PAYMENT_CIRCUIT_OPEN`)
2. Search error codes in backend docs or architecture guide
3. Contact support with error code + timestamp
