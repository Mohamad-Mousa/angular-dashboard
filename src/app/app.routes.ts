import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./dashboard/components/overview/overview').then(
            (m) => m.OverviewComponent,
          ),
      },
      {
        path: 'admins',
        loadComponent: () =>
          import('./dashboard/components/admins/admins').then(
            (m) => m.AdminsComponent,
          ),
      },
      {
        path: 'admin-types',
        loadComponent: () =>
          import('./dashboard/components/admin-types/admin-types').then(
            (m) => m.AdminTypesComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./dashboard/components/settings/settings').then(
            (m) => m.SettingsComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./dashboard/components/profile/profile').then(
            (m) => m.ProfileComponent,
          ),
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
];
