import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountTabPageRoutingModule } from './account-tab-routing.module';

import { AccountTabPage } from './account-tab.page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountTabPageRoutingModule
  ],
  declarations: [AccountTabPage]
})
export class AccountTabPageModule {}
