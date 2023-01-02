import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainTabPageRoutingModule } from './main-tab-routing.module';

import { MainTabPage } from './main-tab.page';

import { InfomodalComponent } from '../infomodal/infomodal.component';

import { ImageCropperModule } from 'ngx-image-cropper';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainTabPageRoutingModule,
    ImageCropperModule,
    SharedDirectivesModule
  ],
  declarations: [MainTabPage, InfomodalComponent]
})
export class MainTabPageModule {}
