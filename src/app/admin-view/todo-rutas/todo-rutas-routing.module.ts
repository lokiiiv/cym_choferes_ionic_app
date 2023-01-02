import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TodoRutasPage } from './todo-rutas.page';

const routes: Routes = [
  {
    path: '',
    component: TodoRutasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TodoRutasPageRoutingModule {}
