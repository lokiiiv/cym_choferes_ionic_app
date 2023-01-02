import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DefineDocsPageRoutingModule } from './define-docs-routing.module';

import { DefineDocsPage } from './define-docs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DefineDocsPageRoutingModule
  ],
  declarations: [DefineDocsPage]
})
export class DefineDocsPageModule {}
