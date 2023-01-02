import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainTabPageRoutingModule } from './main-tab-routing.module';

import { MainTabPage } from './main-tab.page';

import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

import { ModalqrComponent } from '../modalqr/modalqr.component';

import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainTabPageRoutingModule,
    NgxQRCodeModule,
    QRCodeModule
  ],
  declarations: [MainTabPage, ModalqrComponent]
})
export class MainTabPageModule {}
