import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ImportLivingcookbookPage } from './import-livingcookbook.page';

import { GlobalModule } from '~/global.module';

@NgModule({
  declarations: [
    ImportLivingcookbookPage,
  ],
  imports: [
    GlobalModule,
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ImportLivingcookbookPage
      }
    ])
  ],
})
export class ImportLivingcookbookPageModule {}
