import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'recipes',
    loadComponent: () => import('./pages/recipe-list/recipe-list').then(m => m.RecipeListComponent),
  },
  {
    path: 'recipes/new',
    loadComponent: () => import('./pages/recipe-form/recipe-form').then(m => m.RecipeFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'recipes/:id',
    loadComponent: () => import('./pages/recipe-detail/recipe-detail').then(m => m.RecipeDetailComponent),
  },
  {
    path: 'recipes/:id/edit',
    loadComponent: () => import('./pages/recipe-form/recipe-form').then(m => m.RecipeFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'meal-planner',
    loadComponent: () => import('./pages/meal-planner/meal-planner').then(m => m.MealPlannerComponent),
    canActivate: [authGuard],
  },
  {
    path: 'shopping-list',
    loadComponent: () => import('./pages/shopping-list/shopping-list').then(m => m.ShoppingListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/auth').then(m => m.AuthComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/auth').then(m => m.AuthComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
