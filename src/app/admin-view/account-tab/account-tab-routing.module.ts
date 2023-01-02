import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountTabPage } from './account-tab.page';

const routes: Routes = [
  {
    path: '',
    component: AccountTabPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountTabPageRoutingModule {}
