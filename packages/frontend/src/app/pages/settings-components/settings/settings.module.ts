import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SettingsPage } from './settings.page';

import { GlobalModule } from '~/global.module';

@NgModule({
  declarations: [
    SettingsPage,
  ],
  imports: [
    GlobalModule,
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: SettingsPage
      }
    ]),
    FormsModule,
    ReactiveFormsModule
  ],
})
export class SettingsPageModule {}
