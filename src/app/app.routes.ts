import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { LayoutComponent } from './layout/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from '../app/auth/auth.guard';

export const routes: Routes = [

  // --- Public Route ---
  { path: 'login', component: LoginComponent },

  // --- Protected Layout (requires login) ---
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      {
        path: 'master/items',
        loadComponent: () =>
          import('./pages/master/item/item-list.component').then(m => m.ItemListComponent)
      },
      {
        path: 'master/party',
        loadComponent: () =>
          import('./pages/master/party/party-list.component').then(m => m.PartyListComponent)
      },
      {
        path: 'master/size',
        loadComponent: () =>
          import('./pages/master/size/size-list.component').then(m => m.SizeListComponent)
      },
      {
        path: 'master/marketer',
        loadComponent: () =>
          import('./pages/master/marketer/marketer.component').then(m => m.MarketerComponent)
      },
      // {
      //   path: 'master/grade',
      //   loadComponent: () =>
      //     import('./pages/master/grade/grade-list.component').then(m => m.GradeListComponent)
      // },
      // {
      //   path: 'master/transport',
      //   loadComponent: () =>
      //     import('./pages/master/transport/transport-list.component').then(m => m.TransportListComponent)
      // },
      {
        path: 'entry/opening-stock',
        loadComponent: () =>
          import('./pages/Entry/openingstock/opening-stock-list.component')
            .then(m => m.OpeningStockListComponent)
      },
      {
        path: 'entry/purchase',
        loadComponent: () =>
          import('./pages/Entry/purchase-list/purchase-list.component')
            .then(m => m.PurchaseListComponent)
      },
      {
        path: 'entry/order',
        loadComponent: () =>
          import('./pages/Entry/order-list/order-list.component')
            .then(m => m.OrderListComponent)
      },
      {
        path: 'entry/dispatch',
        loadComponent: () =>
          import('./pages/Entry/dispatch-list/dispatch-list.component')
            .then(m => m.DispatchListComponent)
      },
      {
        path: 'stock/finish-stock',
        loadComponent: () => import('./pages/Stock/finish-stock/finish-stock.component')
          .then(m => m.FinishStockComponent)
      },
      {
        path: 'stock/after-order-stock',
        loadComponent: () => import('./pages/Stock/after-order-stock.component/after-order-stock.component')
          .then(m => m.AfterOrderStockComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // --- Fallback ---
  { path: '**', redirectTo: 'dashboard' }
];