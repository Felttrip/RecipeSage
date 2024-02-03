import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ShoppingListItemComponent } from "./shopping-list-item.component";
import { GlobalModule } from "~/global.module";

@NgModule({
  declarations: [ShoppingListItemComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    GlobalModule,
  ],
  exports: [ShoppingListItemComponent],
})
export class ShoppingListItemModule {}
