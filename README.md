# NapraviMi_web_client

Frontend for **NapraviMi** — a two-sided marketplace connecting customers with craftsmen. Built with Angular and PrimeNG.

Live at [napravimi.com](https://napravimi.com). Backend API: [PocketArtisan_Web_API](https://github.com/remaxsrb/PocketArtisan_Web_API), served from `api.napravimi.com`.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Angular 21 |
| UI components | PrimeNG 21 (+ `@primeuix/themes`) |
| Reactive state | RxJS |
| Auth | `@auth0/angular-jwt` |
| Charts | Chart.js |
| Testing | Vitest |
| Deployment | Cloudflare Workers |

## Architecture

Standard Angular application structure under `src/app/`:

- **`components/`** — feature components: `admin`, `craftsman`, `craftsman-application`, `craftsmen-overview`, `homepage` / `homepage-welcome`, `products`, `signin`, `user`, `user-registration`, plus shared `common` components.
- **`services/`** — one folder per domain area mirroring the backend's modules: `cart`, `craft`, `craftsman`, `craftsman-application`, `order`, `payment`, `product`, `product_category`, `user`, plus `utils`.
- **`guards/`** — route guards (auth/role-based access).
- **`interceptors/`** — HTTP interceptors (e.g. attaching JWT auth headers, handling structured backend errors).
- **`interfaces/` / `models/`** — TypeScript types for API contracts and domain models.

### Reactive state patterns

Key parts of the app have been refactored from imperative, one-shot state reads toward reactive streams:

- **`AuthService`** exposes a `BehaviorSubject`-backed `authState$` stream, so components like the navbar/header react automatically to login, logout, and session expiry instead of only checking auth state once in `ngOnInit`.
- **`CraftsmenOverview`** uses a single reactive `state$` observable pipeline consumed via the `async` pipe, rather than imperative lifecycle-hook-driven state updates.

See `notes/REACTIVE_AUTH_STATE.md` and `notes/REACTIVE_CRAFTSMEN_OVERVIEW.md` for the reasoning behind these refactors.

### Payment error handling

Client-side payment error handling is a dedicated concern: structured `PaymentError` responses from the backend (HTTP 402/503/502) are mapped to Serbian-language user-facing messages, with retry logic and contextual recovery actions depending on the failure type. See `notes/CLIENT_PAYMENT_ERROR_ARCHITECTURE.md`, `notes/PAYMENT_ERROR_IMPLEMENTATION_ROADMAP.md`, and `notes/PAYMENT_ERR_COMPONENT_GUIDE.md`.

## Deployment

The app is deployed as a **Cloudflare Worker**, not classic Cloudflare Pages (the classic Pages creation flow has been removed from the dashboard for new projects). Configuration:

- `wrangler.jsonc` — Worker config, bound to the `napravimi.com` domain, with `run_worker_first: true`.
- `worker/index.js` — Worker entry point, serves the built app from `dist/web_client/browser`.

## Local Development

```bash
npm install
ng serve -o
```

This starts the Angular dev server and opens the app in your browser. The dev server expects the backend API to be reachable (see the backend repo's local setup) — CORS on the backend is configured for `http://localhost:4200`.

### Environment configuration

> **Not yet set up.** There is currently no `src/environments/` folder or `angular.json` `fileReplacements` config, so there's no environment-variable switching between local/dev/prod builds. Options under consideration: Angular's standard `environment.ts` / `environment.prod.ts` file-replacement approach, esbuild `define` substitution, or runtime injection via the Cloudflare Worker.

## Notes

Implementation notes and design decisions live in `/notes`, kept as reference material — including the reactive-state refactors, payment error architecture, and a comparison of `localStorage` vs. `sessionStorage` for token storage.
