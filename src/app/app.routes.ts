import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/homepage/homepage').then((m) => m.Homepage),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/homepage-welcome/homepage-welcome').then(
            (m) => m.HomepageWelcome,
          ),
      },
      {
        path: 'craftsmen',
        loadComponent: () =>
          import('./components/craftsmen-overview/craftsmen-overview').then(
            (m) => m.CraftsmenOverview,
          ),
      },
    ],
  },
  {
    path: 'craftsman-apply',
    loadComponent: () =>
      import('./components/craftsman-application/craftsman-application').then(
        (m) => m.CraftsmanApplication,
      ),
  },
  {
    path: 'user-registration',
    loadComponent: () =>
      import('./components/user-registration/user-registration').then(
        (m) => m.UserRegistration,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/signin/signin').then((m) => m.Signin),
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./components/user/change-password/change-password').then(
        (m) => m.ChangePassword,
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/common/profile-settings/profile-settings').then(
        (m) => m.ProfileSettings,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user',
    loadComponent: () =>
      import('./components/user/user-dashboard/user-dashboard').then(
        (m) => m.UserDashboard,
      ),
    canActivate: [authGuard, roleGuard],
    data: { expected_role: 'user' },
    children: [
      {
        path: 'cart',
        loadComponent: () =>
          import('./components/common/cart/cart').then((m) => m.Cart),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./components/common/order-overview/order-overview').then(
            (m) => m.OrderOverview,
          ),
      },
    ],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/common/userprofile/userprofile').then(
        (m) => m.Userprofile,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'internal-login',
    loadComponent: () =>
      import('./components/admin/admin-login/admin-login').then(
        (m) => m.AdminLogin,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboard,
      ),
    canActivate: [authGuard, roleGuard],
    data: { expected_role: 'admin' },
    children: [
      {
        path: 'craftsman-applications',
        loadComponent: () =>
          import(
            './components/admin/craftsman-applications/craftsman-applications'
          ).then((m) => m.CraftsmanApplications),
      },
      {
        path: 'set-roles',
        loadComponent: () =>
          import('./components/admin/set-roles/set-roles').then(
            (m) => m.SetRoles,
          ),
      },
    ],
  },
  {
    path: 'craftsman',
    loadComponent: () =>
      import('./components/user/user-dashboard/user-dashboard').then(
        (m) => m.UserDashboard,
      ),
    canActivate: [authGuard, roleGuard],
    data: { expected_role: 'craftsman' },
    children: [
      {
        path: 'add-product',
        loadComponent: () =>
          import('./components/products/add-product/add-product').then(
            (m) => m.AddProduct,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./components/common/order-overview/order-overview').then(
            (m) => m.OrderOverview,
          ),
      },
    ],
  },
  {
    path: 'profile/:username',
    loadComponent: () =>
      import('./components/common/userprofile/userprofile').then(
        (m) => m.Userprofile,
      ),
  },
  {
    path: 'products/:username',
    loadComponent: () =>
      import(
        './components/products/products-by-craftsman/products-by-craftsman/products-by-craftsman'
      ).then((m) => m.ProductsByCraftsman),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import(
        './components/products/product-page/product-page/product-page'
      ).then((m) => m.ProductPage),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./components/common/payment/payment').then((m) => m.Payment),
    canActivate: [authGuard, roleGuard],
    data: { expected_role: 'user' },
  },
];
