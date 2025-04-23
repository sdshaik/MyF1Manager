import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'schedule',
    loadComponent: () => import('./features/schedule/schedule.component').then(m => m.ScheduleComponent),
  },
  {
    path: 'results',
    loadComponent: () => import('./features/results/results.component').then(m => m.ResultsComponent),
  },
  {
    path: 'drivers',
    loadComponent: () => import('./features/drivers/drivers.component').then(m => m.DriversComponent),
  },
  {
    path: 'drivers/:id',
    loadComponent: () => import('./features/drivers/driver-detail/driver-detail.component').then(m => m.DriverDetailComponent),
  },
  {
    path: 'teams',
    loadComponent: () => import('./features/teams/teams.component').then(m => m.TeamsComponent),
  },
  {
    path: 'teams/:id',
    loadComponent: () => import('./features/teams/team-detail/team-detail.component').then(m => m.TeamDetailComponent),
  },
  {
    path: 'standings',
    loadComponent: () => import('./features/standings/standings.component').then(m => m.StandingsComponent),
  },
  {
    path: 'live',
    loadComponent: () => import('./features/live-timing/live-timing.component').then(m => m.LiveTimingComponent),
  },
  {
    path: '**',
    redirectTo: ''
  }
];