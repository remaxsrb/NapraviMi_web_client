# localStorage vs sessionStorage

## Overview

Both `localStorage` and `sessionStorage` are part of the **Web Storage API**, allowing browsers to store key-value pairs locally. They share the same API surface but differ in one critical way: **lifetime and scope**.

---

## Key Differences

| Feature | `localStorage` | `sessionStorage` |
|---|---|---|
| **Persistence** | Until explicitly cleared | Until the tab/window is closed |
| **Scope** | All tabs/windows on the same origin | Only the current tab/window |
| **Shared across tabs** | Yes | No |
| **Survives page refresh** | Yes | Yes |
| **Survives browser close** | Yes | No |
| **Storage limit** | ~5–10 MB (browser-dependent) | ~5 MB (browser-dependent) |
| **Accessible via JS** | Yes | Yes |
| **Sent with HTTP requests** | No | No |

---

## The Same API

Both storages expose identical methods:

```javascript
// Store a value
localStorage.setItem('key', 'value');
sessionStorage.setItem('key', 'value');

// Retrieve a value
const val = localStorage.getItem('key');
const val = sessionStorage.getItem('key');

// Remove a specific key
localStorage.removeItem('key');
sessionStorage.removeItem('key');

// Clear all keys
localStorage.clear();
sessionStorage.clear();

// Get number of stored items
console.log(localStorage.length);
console.log(sessionStorage.length);
```

Storing objects requires serialization:

```javascript
// Write
localStorage.setItem('user', JSON.stringify({ name: 'Alice', role: 'admin' }));

// Read
const user = JSON.parse(localStorage.getItem('user'));
```

---

## When to Use `localStorage`

Use `localStorage` when data should **persist beyond the current session** and be **available across tabs**.

**Good use cases:**
- User preferences (theme, language, font size)
- Remembering a logged-in user's display name or avatar URL (non-sensitive)
- Caching API responses that rarely change (e.g. static config, feature flags)
- Saving draft content the user can return to later
- Persisting app state across page reloads in SPAs (e.g. sidebar collapsed state)

**Example:**
```javascript
// Save theme preference
localStorage.setItem('theme', 'dark');

// Apply on load
const theme = localStorage.getItem('theme') ?? 'light';
document.body.classList.add(theme);
```

---

## When to Use `sessionStorage`

Use `sessionStorage` when data should be **isolated to a single tab** and **discarded when the tab closes**.

**Good use cases:**
- Multi-step forms (wizard state that resets after submission or tab close)
- One-time navigation state (e.g. "came from search results")
- Temporary filters or sorting preferences within a session
- Tab-specific state where two open tabs should be independent (e.g. different user contexts)
- Sensitive transient data that must not persist (e.g. a temporary access token scoped to one flow)

**Example:**
```javascript
// Save form progress across steps
sessionStorage.setItem('checkout_step', JSON.stringify({ step: 2, items: [...] }));

// Restore on step re-visit
const progress = JSON.parse(sessionStorage.getItem('checkout_step'));
```

---

## What Neither Should Store

Both storages are **synchronous**, **unencrypted**, and **accessible to any JS running on the page**, making them unsuitable for:

- Passwords or secrets
- Auth tokens with broad scope (prefer `HttpOnly` cookies instead)
- Large binary data (use IndexedDB)
- Anything that must survive a device wipe or browser data clear

---

## Quick Decision Guide

```
Does the data need to survive closing the tab?
├── Yes → localStorage
│   └── Should it be tab-isolated?
│       └── If yes, reconsider — localStorage is shared.
│           Use a tab ID key if isolation with persistence is needed.
└── No → sessionStorage
    └── Is it sensitive or transient by nature?
        └── If yes, sessionStorage is the safer default.
```

---

## Summary

- **`localStorage`** — persistent, cross-tab, ideal for user preferences and cached state.
- **`sessionStorage`** — ephemeral, tab-scoped, ideal for transient flow state and wizard steps.
- Neither is a substitute for secure, server-side session management.
