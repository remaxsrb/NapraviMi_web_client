/**
 * The API wraps every response in a `{ data, meta, error }` envelope. These helpers unwrap
 * it while staying tolerant of legacy raw responses during the migration.
 */

export function unwrapArray<T>(response: T[] | { data: T[] } | null | undefined): T[] {
  if (Array.isArray(response)) return response;
  return response?.data ?? [];
}

export function unwrapEnvelope<T>(response: { data: T } | T | null | undefined): T {
  return (response as { data: T })?.data ?? (response as T);
}

/** Extracts the message from an API error envelope's `error.message`, falling back otherwise. */
export function extractErrorMessage(err: any, fallback: string): string {
  return err?.error?.error?.message || fallback;
}

/**
 * Cart mutation endpoints (add/remove) have been seen returning the cart nested under a
 * `cart` key ({ cart: {...} }) as well as the cart object directly at the top level. Accept
 * either so a backend contract change in either direction doesn't silently break the client.
 */
export function unwrapCart<T>(response: { cart: T } | T | null | undefined): T {
  return (response as { cart: T })?.cart ?? (response as T);
}
