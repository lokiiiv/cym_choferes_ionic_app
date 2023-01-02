import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AllChoferesPageRoutingModule } from './all-choferes-routing.module';

import { AllChoferesPage } from './all-choferes.page';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AllChoferesPageRoutingModule,
    SharedDirectivesModule
  ],
  declarations: [AllChoferesPage]
})
export class AllChoferesPageModule {}
