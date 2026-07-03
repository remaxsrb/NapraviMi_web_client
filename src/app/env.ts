/**
 * Central environment configuration.
 * Backend host without trailing slash, e.g. `https://api.napravimi.com`.
 */
export const API_HOST = 'https://api.napravimi.com';

/** Base URL for all REST endpoints. */
export const API_BASE_URL = `${API_HOST}/api`;

/** Host used to authorize JWT attachment (no protocol). */
export const API_ALLOWED_DOMAIN = 'api.napravimi.com';
