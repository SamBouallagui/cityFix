import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [roleGuard('citizen')], // guards the WHOLE tabs section at once — no need to repeat it on each child
    children: [
      {
        path: 'my-reports',
        loadComponent: () => import('./pages/citizen-home/citizen-home.page').then(m => m.CitizenHomePage),
      },
      {
        path: 'nearby',
        loadComponent: () => import('./pages/nearby-reports/nearby-reports.page').then(m => m.NearbyReportsPage),
      },
      { path: '', redirectTo: 'my-reports', pathMatch: 'full' },
    ],
  },
  {
    path: 'new-report',
    loadComponent: () => import('./pages/new-report/new-report.page').then(m => m.NewReportPage),
    canActivate: [roleGuard('citizen')],
  },
  {
    path: 'agent-dashboard',
    loadComponent: () => import('./pages/agent-dashboard/agent-dashboard.page').then(m => m.AgentDashboardPage),
    canActivate: [roleGuard('agent')],
  },
  {
    path: 'nearby-reports',
    loadComponent: () => import('./pages/nearby-reports/nearby-reports.page').then( m => m.NearbyReportsPage)
  },
];
