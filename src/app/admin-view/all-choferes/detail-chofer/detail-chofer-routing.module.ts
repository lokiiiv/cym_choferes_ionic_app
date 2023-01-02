import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailChoferPage } from './detail-chofer.page';

const routes: Routes = [
  {
    path: '',
    component: DetailChoferPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailChoferPageRoutingModule {}
