import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChoferTabsPage } from './chofer-tabs.page';
import { QuizGuard } from 'src/app/shared/guards/quiz.guard';

const routes: Routes = [
  {
    path: '',
    component: ChoferTabsPage,
    children : [
      {
        path : 'main',
        loadChildren : () => import('../main-tab/main-tab.module').then( m => m.MainTabPageModule)
      },
      {
        path : 'account',
        loadChildren: () => import('../account-tab/account-tab.module').then( m => m.AccountTabPageModule)
      },
      {
        path : 'main/video',
        loadChildren: () => import('../video/video.module').then( m => m.VideoPageModule)
      },
      {
        path : 'main/quiz',
        loadChildren: () => import('../quiz/quiz.module').then( m => m.QuizPageModule),
        canActivate: [QuizGuard]
      },
      {
        path : 'main/docs',
        loadChildren : () => import('../docs/docs.module').then( m => m.DocsPageModule)
      },
      {
        path : '',
        redirectTo : '/chofer-tabs/main',
        pathMatch : 'full'
      }
    ]
  },
  {
    path : '',
    redirectTo : '/chofer-tabs/main',
    pathMatch : 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChoferTabsPageRoutingModule {}
