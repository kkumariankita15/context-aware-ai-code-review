import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./overview/overview.component').then(module => module.OverviewComponent)
  },
  { path: 'overview', pathMatch: 'full', redirectTo: '' },
  {
    path: 'review',
    loadComponent: () => import('./review-page/review-page.component').then(module => module.ReviewPageComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./review-history/review-history.component').then(module => module.ReviewHistoryComponent)
  },
  {
    path: 'knowledge',
    loadComponent: () => import('./knowledge-base/knowledge-base.component').then(module => module.KnowledgeBaseComponent)
  },
  {
    path: 'appearance',
    loadComponent: () => import('./appearance/appearance.component').then(module => module.AppearanceComponent)
  },
  { path: '**', redirectTo: '' }
];
