import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RegexPatterns } from '../../../regexPatterns';
import { PaymentService, NewOrderRequest, CreditCardData } from '../../../services/payment/payment-service';

export type PaymentType = 'cash' | 'card' | null;
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
  imports: [CommonModule, ButtonModule, CardModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  private router = inject(Router);
  private paymentService = inject(PaymentService);

  selectedPayment: PaymentType = null;
  isLoading = false;
  errorMessage: string | null = null;

  addressForm = new FormGroup({
    street: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    postalCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{5,6}$/)]),
  });

  cardForm = new FormGroup({
    cardNumber: new FormControl('', [Validators.required, cardNumberValidator]),
    cardHolder: new FormControl('', [Validators.required]),
    expiry: new FormControl('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]),
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
    if (this.selectedPayment === 'card' && this.cardForm.invalid) return false;
    return true;
  }

  select(type: PaymentType): void {
    this.selectedPayment = type;
  }

  confirm(): void {
    if (!this.isFormValid) return;

    this.isLoading = true;
    this.errorMessage = null;

    const userData = localStorage.getItem('userData');
    if (!userData) {
      this.errorMessage = 'Korisnikovi podaci nisu dostupni';
      this.isLoading = false;
      return;
    }

    const user = JSON.parse(userData);
    const cartItems = user.cart?.items || [];

    if (cartItems.length === 0) {
      this.errorMessage = 'Korpa je prazna';
      this.isLoading = false;
      return;
    }

    const craftsmanId = cartItems[0]?.product?.craftsmanId;
    if (!craftsmanId) {
      this.errorMessage = 'Greška pri preuzimanju podataka o zanatliji';
      this.isLoading = false;
      return;
    }

    // Merge address fields
    const addressForm = this.addressForm.value;
    const shippingAddress = `${addressForm.street}, ${addressForm.city} ${addressForm.postalCode}`;

    // Build items array
    const items = cartItems.map((item: any) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    // Build order request
    const orderRequest: NewOrderRequest = {
      craftsman_id: craftsmanId,
      items,
      payment_type: this.selectedPayment as 'cash' | 'card',
      shipping_address: shippingAddress,
    };

    // Add credit card data if paying by card
    if (this.selectedPayment === 'card') {
      const cardForm = this.cardForm.value;
      orderRequest.credit_card_data = {
        owner_name: cardForm.cardHolder!,
        card_number: (cardForm.cardNumber || '').replace(/\s/g, ''),
        expiration_date: cardForm.expiry!,
        cvv: cardForm.cvv!,
      };
    }

    // Submit order
    this.paymentService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Order created successfully:', response);
        // TODO: Clear cart and redirect to success page
        this.router.navigate(['/user/cart']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Greška pri kreiranju porudžbine';
        console.error('Error creating order:', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/user/cart']);
  }
}
