import { Routes } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { HomepageWelcome } from './components/homepage-welcome/homepage-welcome';
import { CraftsmenOverview } from './components/craftsmen-overview/craftsmen-overview';
import { CraftsmanApplication } from './components/craftsman-application/craftsman-application';
import { UserRegistration } from './components/user-registration/user-registration';
import { Signin } from './components/signin/signin';
import { UserDashboard } from './components/user/user-dashboard/user-dashboard';
import { authGuard } from './guards/auth-guard';
import { Userprofile } from './components/common/userprofile/userprofile';
import { roleGuard } from './guards/role-guard';
import { ChangePassword } from './components/user/change-password/change-password';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { AdminLogin } from './components/admin/admin-login/admin-login';
import { CraftsmanApplications } from './components/admin/craftsman-applications/craftsman-applications';
import { SetRoles } from './components/admin/set-roles/set-roles';
import { ProfileSettings } from './components/common/profile-settings/profile-settings';
import { ProductsByCraftsman } from './components/products/products-by-craftsman/products-by-craftsman/products-by-craftsman';
import { ProductPage } from './components/products/product-page/product-page/product-page';
import { AddProduct } from './components/products/add-product/add-product';
import { Cart } from './components/common/cart/cart';
export const routes: Routes = [
  {
    path: '',
    component: Homepage,
    children: [
      { path: '', component: HomepageWelcome },
      { path: 'craftsmen', component: CraftsmenOverview },
    ],
  },
  { path: 'craftsman-apply', component: CraftsmanApplication },
  { path: 'user-registration', component: UserRegistration },
  { path: 'login', component: Signin },
  { path: 'change-password', component: ChangePassword},
  { path: 'settings', component: ProfileSettings, canActivate: [authGuard] },
  {
    path: 'user',
    component: UserDashboard,
    canActivate: [authGuard, roleGuard],
    data: { expected_role: 'user' },
    children: [
      {
        path: 'cart',
        component: Cart,
      },
    ],
  },
  {
    path: 'profile',
    component: Userprofile,
    canActivate: [authGuard],
  },
  {
    path: 'internal-login',
    component: AdminLogin,
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard],
    data: { expected_role: 'admin' },
    children: [
      { path: 'craftsman-applications', component: CraftsmanApplications },
      { path: 'set-roles', component: SetRoles },
    ],
  },
  {
    path: 'craftsman',
    component: UserDashboard,
    canActivate: [authGuard, roleGuard],
    data: { expected_role: 'craftsman' },
    children: [
      { path: 'add-product', component: AddProduct },
    ],
  },
  {
    path: 'profile/:username',
    component: Userprofile,
  },
  {
    path: 'products/:username',
    component: ProductsByCraftsman,
  },
  {
    path: 'product/:id',
    component: ProductPage,
  },
];
