export type PaymentMethod = 'COD' | 'CC';

export interface CreditCardData {
  owner_name: string;
  card_number: string;
  expiration_date: string;
  cvv: string;
}

export interface CheckoutPayload {
  payment_type: PaymentMethod;
  shipping_address: string;
  credit_card_data?: CreditCardData;
}
