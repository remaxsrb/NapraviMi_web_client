# Reactive Auth State

## Problem

Menu items (`Navbar`) and the header user info (`Header`) were built once in `ngOnInit` and never updated afterward. This meant:

- After logout, the navbar still showed the previous role's menu items.
- After session expiry (token expired in localStorage), the UI still appeared as logged in.
- After login, the header avatar/user info stayed stale until a full page reload.

The root cause was that both components read auth state once at initialization and had no way to react to changes.

## Solution

A `BehaviorSubject`-based auth stream was added to `AuthService`. Components subscribe to it and rebuild their state whenever it emits.

### AuthService changes

Two additions:

```ts
private authState$ = new BehaviorSubject<boolean>(this.is_LoggedIn());
readonly authChanged$ = this.authState$.asObservable();
```

`authChanged$` emits `true` on login and `false` on logout.

A `setSession()` method centralizes writing the token and user data to `localStorage` and triggers the emission:

```ts
setSession(token: string, userData: any): void {
  localStorage.setItem(this.TOKEN_KEY, token);
  localStorage.setItem('userData', JSON.stringify(userData));
  this.authState$.next(true);
}
```

`logout()` also triggers the emission:

```ts
logout() {
  localStorage.removeItem(this.TOKEN_KEY);
  localStorage.removeItem('userData');
  this.authState$.next(false);
  this.router.navigate(['']);
}
```

### Signin change

`Signin` now calls `authService.setSession()` instead of writing to `localStorage` directly. This ensures the auth stream fires on every successful login.

### Navbar change

Menu building was moved from `ngOnInit` into a `buildItems()` method. The component subscribes to `authChanged$` and calls `buildItems()` on every emission:

```ts
ngOnInit(): void {
  this.buildItems();
  this.authService.authChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => this.buildItems());
}
```

The subscription is cleaned up in `ngOnDestroy` via a `destroy$` subject to avoid memory leaks.

> **Note:** The craftsman "Dodaj proizvod" item previously used `command: () => this.addProductClick.emit()` to toggle a section inside `UserDashboard`. After `<router-outlet>` was added to `UserDashboard` to support child routes, this approach conflicted — the outlet would overlay the toggled section. The item was changed to use `routerLink: '/craftsman/add-product'` and a matching child route was added under the `craftsman` path in `app.routes.ts`.

### Header change

Same pattern — user loading was moved to `loadUser()`, called on init and on every auth change:

```ts
ngOnInit(): void {
  this.loadUser();
  this.authService.authChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadUser());
}
```

## Flow

```
Login
  └─ Signin calls authService.setSession()
        └─ authState$.next(true)
              ├─ Navbar.buildItems() → shows role-specific menu
              └─ Header.loadUser()  → shows correct user info

Logout
  └─ AuthService.logout()
        └─ authState$.next(false)
              ├─ Navbar.buildItems() → shows guest menu
              └─ Header.loadUser()  → clears user info
```

## Memory Leak Prevention

Both `Navbar` and `Header` implement `OnDestroy` and use `takeUntil(destroy$)` to unsubscribe from `authChanged$` when the component is destroyed.
