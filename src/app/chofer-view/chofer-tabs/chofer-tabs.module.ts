import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChoferTabsPageRoutingModule } from './chofer-tabs-routing.module';

import { ChoferTabsPage } from './chofer-tabs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChoferTabsPageRoutingModule
  ],
  declarations: [ChoferTabsPage]
})
export class ChoferTabsPageModule {}
