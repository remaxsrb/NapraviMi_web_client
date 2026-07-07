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

export interface PaymentErrorDetails {
  code: string;
  reason: string;
  retryable: boolean;
  timestamp: string;
}

/** Shape of the `error` field in the API's `{ data, meta, error }` response envelope. */
export interface PaymentAPIError {
  message: string;
  code: string;
  reason: string;
  retryable: boolean;
  timestamp: string;
}

export interface PaymentErrorResponse {
  data: null;
  meta: null;
  error: PaymentAPIError;
}

export interface UserAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

export interface ParsedPaymentError {
  code: string;
  reason: string;
  retryable: boolean;
  timestamp: Date;
  userMessage: string;
  actionItems: UserAction[];
  isPaymentError: boolean;
  httpStatus: number;
  originalError?: any;
}
