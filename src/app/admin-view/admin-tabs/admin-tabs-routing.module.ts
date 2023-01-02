import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminTabsPage } from './admin-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: AdminTabsPage,
    children : [
      {
        path : 'main',
        loadChildren : () => import('../main-tab/main-tab.module').then( m => m.MainTabPageModule)
      },
      {
        path : 'account',
        loadChildren : () => import('../account-tab/account-tab.module').then( m => m.AccountTabPageModule)
      },
      {
        path : 'main/choferes-lista',
        loadChildren : () => import('../all-choferes/all-choferes.module').then( m => m.AllChoferesPageModule)
      },
      {
        path : 'main/choferes-lista/detail/:idUser',
        loadChildren : () => import('../all-choferes/detail-chofer/detail-chofer.module').then( m => m.DetailChoferPageModule)
      },
      {
        path : 'main/rutas-activas',
        loadChildren : () => import('../todo-rutas/todo-rutas.module').then( m => m.TodoRutasPageModule)
      },
      {
        path : 'main/definir-documentos',
        loadChildren : () => import('../define-docs/define-docs.module').then( m => m.DefineDocsPageModule)
      },
      {
        path: 'main/crear-usuarios',
        loadChildren : () => import('../add-user/add-user.module').then( m => m.AddUserPageModule)
      },
      {
        path : '',
        redirectTo : '/admin-tabs/main',
        pathMatch : 'full'
      }
    ]
  },
  {
    path : '',
    redirectTo : '/admin/tabs/main',
    pathMatch : 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminTabsPageRoutingModule {}
