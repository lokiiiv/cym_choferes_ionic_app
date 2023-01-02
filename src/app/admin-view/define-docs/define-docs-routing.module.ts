import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefineDocsPage } from './define-docs.page';

const routes: Routes = [
  {
    path: '',
    component: DefineDocsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DefineDocsPageRoutingModule {}
