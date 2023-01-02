import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TodoRutasPageRoutingModule } from './todo-rutas-routing.module';

import { TodoRutasPage } from './todo-rutas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TodoRutasPageRoutingModule
  ],
  declarations: [TodoRutasPage]
})
export class TodoRutasPageModule {}
