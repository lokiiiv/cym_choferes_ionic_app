import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailChoferPageRoutingModule } from './detail-chofer-routing.module';

import { DetailChoferPage } from './detail-chofer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailChoferPageRoutingModule
  ],
  declarations: [DetailChoferPage]
})
export class DetailChoferPageModule {}
