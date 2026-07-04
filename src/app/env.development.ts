/**
 * Central environment configuration.
 * Backend host without trailing slash, e.g. `https://api.napravimi.com`.
 */
export const API_HOST = 'http://localhost:8080';

/** Base URL for all REST endpoints. */
export const API_BASE_URL = `${API_HOST}/api`;
export const API_ADMIN_URL = `${API_BASE_URL}/admin`;

/** Host used to authorize JWT attachment (no protocol). */
export const API_ALLOWED_DOMAIN = 'localhost:8080';

export const TURNSTILE_SITE_KEY = '0x4AAAAAADvDa6C1XKrZfYPm';

/** Whether the Turnstile captcha widget is required. Disabled in dev, enabled in production. */
export const ENABLE_TURNSTILE = false;
