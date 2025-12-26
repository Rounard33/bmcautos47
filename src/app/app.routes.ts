import {Routes} from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  { 
    path: 'cgu', 
    loadComponent: () => import('./pages/cgu/cgu.component').then(m => m.CguComponent)
  },
  { 
    path: 'mentions-legales', 
    loadComponent: () => import('./pages/legal/legal.component').then(m => m.LegalComponent)
  },
  { path: '**', redirectTo: '/home' }
];
