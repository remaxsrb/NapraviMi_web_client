import { Component, inject, viewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RegexPatterns } from '../../../regexPatterns';
import { CartService } from '../../../services/cart/cart-service';
import { AuthService } from '../../../services/utils/auth-service';
import { CheckoutPayload, ParsedPaymentError } from '../../../interfaces/payment';
import { CheckoutResponse } from '../../../interfaces/order';
import { PaymentErrNotification } from '../payment-err-notification/payment-err-notification';
import { PaymentErrorHandler } from '../../../services/utils/payment-error-handler';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';

export type PaymentType = 'CC' | 'COD' | null;
export type CardType = 'VISA' | 'MASTERCARD' | 'DINERS' | null;

function cardNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value || '').replace(/\s/g, '');
  if (!value) return null;
  const valid = Object.values(RegexPatterns.cardPatterns).some((p) => p.test(value));
  return valid ? null : { invalidCard: true };
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ReactiveFormsModule,
    PaymentErrNotification,
    ToastModule
  ],
  providers: [MessageService, PaymentErrorHandler],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  private router = inject(Router);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private errorHandler = inject(PaymentErrorHandler);

  errorNotification = viewChild(PaymentErrNotification);

  selectedPayment: PaymentType = null;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  paymentError = signal<ParsedPaymentError | null>(null);

  addressForm = new FormGroup({
    street: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    postalCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{5,6}$/)]),
  });

  cardForm = new FormGroup({
    cardNumber: new FormControl('', [Validators.required, cardNumberValidator]),
    cardHolder: new FormControl('', [Validators.required]),
    expiry: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/),
    ]),
    cvv: new FormControl('', [Validators.required, Validators.pattern(/^\d{3,4}$/)]),
  });

  get detectedCardType(): CardType {
    const num = (this.cardForm.get('cardNumber')?.value || '').replace(/\s/g, '');
    for (const [type, pattern] of Object.entries(RegexPatterns.cardPatterns)) {
      if (pattern.test(num)) return type as CardType;
    }
    return null;
  }

  get isFormValid(): boolean {
    if (!this.selectedPayment) return false;
    if (this.addressForm.invalid) return false;
    if (this.selectedPayment === 'CC' && this.cardForm.invalid) return false;
    return true;
  }

  select(type: PaymentType): void {
    this.selectedPayment = type;
  }

  confirm(): void {
    if (!this.isFormValid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.paymentError.set(null);

    const addressForm = this.addressForm.value;
    const shippingAddress = `${addressForm.street}, ${addressForm.city} ${addressForm.postalCode}`;

    const payload: CheckoutPayload = {
      payment_type: this.selectedPayment as 'COD' | 'CC',
      shipping_address: shippingAddress,
    };

    if (this.selectedPayment === 'CC') {
      const cardForm = this.cardForm.value;
      payload.credit_card_data = {
        owner_name: cardForm.cardHolder!,
        card_number: (cardForm.cardNumber || '').replace(/\s/g, ''),
        expiration_date: cardForm.expiry!,
        cvv: cardForm.cvv!,
      };
    }

    this.cartService.checkout(payload).subscribe({
      next: (response: CheckoutResponse) => {
        this.isLoading.set(false);
        this.clearCartFromLocalState();

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Plaćanje uspešno',
          detail: 'Vaša porudžbina je kreirana. Proverite email za detalje.',
          life: 5000,
        });

        // Extract orders from response
        const ordersArray = response?.orders || [];

        // Open PDF for each order
        ordersArray.forEach((order: any) => {
          const pdfUrl = order.pdf_url || order.url;
          if (pdfUrl) {
            console.log('Opening PDF:', pdfUrl);
            window.open(pdfUrl, '_blank');
          }
        });

        // Navigate after short delay to let user see success message
        setTimeout(() => {
          this.router.navigate([this.getDashboardRouteByRole()]);
        }, 1500);
      },
      error: (err: HttpErrorResponse | any) => {
        this.isLoading.set(false);

        // Handle structured payment errors
        if (this.errorHandler.isPaymentError(err)) {
          const parsed = this.errorHandler.parsePaymentError(err);
          const enriched = this.errorHandler.enrichErrorWithActions(
            parsed,
            () => this.confirm(), // Retry
            undefined, // No card change in this flow
            () => this.contactSupport(), // Support
          );
          this.paymentError.set(enriched);
          this.errorNotification()?.showPaymentError(enriched);
        } else {
          // Fallback for non-payment errors
          this.errorMessage.set(err.error?.message || 'Greška pri kreiranju porudžbine');
        }
      },
    });
  }

  private contactSupport(): void {
    // TODO: Implement support contact (chat, email form, etc.)
    console.log('Opening support channel...');
  }

  goBack(): void {
    this.errorNotification()?.clearError();
    this.router.navigate(['/user/cart']);
  }

  private clearCartFromLocalState(): void {
    const raw = localStorage.getItem('userData');
    if (!raw) return;

    const user = JSON.parse(raw);
    if (!user.cart) {
      user.cart = { id: null, items: [], total: 0 };
    }

    user.cart.items = [];
    user.cart.total = 0;
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private getDashboardRouteByRole(): string {
    const role = this.authService.get_role();

    if (role === 'admin') return '/admin';
    if (role === 'craftsman') return '/craftsman';
    return '/user';
  }
}
