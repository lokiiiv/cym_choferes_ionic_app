import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AllChoferesPage } from './all-choferes.page';

const routes: Routes = [
  {
    path: '',
    component: AllChoferesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllChoferesPageRoutingModule {}
