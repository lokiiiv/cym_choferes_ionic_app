import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { AutoLoginGuard } from './shared/guards/auto.login.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
    pathMatch: 'full',
    canActivate: [AutoLoginGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
    canActivate: [AutoLoginGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule),
    canActivate: [AutoLoginGuard]
  },
  {
    path: 'chofer-tabs',
    loadChildren: () => import('./chofer-view/chofer-tabs/chofer-tabs.module').then( m => m.ChoferTabsPageModule),
    canActivate : [AuthGuard],
    data: {
      roles: ['chofer']
    }
  },
  {
    path: 'admin-tabs',
    loadChildren: () => import('./admin-view/admin-tabs/admin-tabs.module').then( m => m.AdminTabsPageModule),
    canActivate: [AuthGuard],
    data: {
      roles: ['admin', 'seguridad', 'vigilancia', 'logistica']
    }
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
