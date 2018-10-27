import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { RecipeServiceProvider } from '../../../providers/recipe-service/recipe-service';
import { LoadingServiceProvider } from '../../../providers/loading-service/loading-service';
import { UtilServiceProvider } from '../../../providers/util-service/util-service';

@IonicPage({
  priority: 'low'
})
@Component({
  selector: 'page-new-shopping-list-item-modal',
  templateUrl: 'new-shopping-list-item-modal.html',
})
export class NewShoppingListItemModalPage {

  inputType: string = 'items';

  itemFields: any = [{}];

  selectedRecipe: any;
  selectedIngredients: any;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public utilService: UtilServiceProvider,
    public recipeService: RecipeServiceProvider,
    public loadingService: LoadingServiceProvider,
    public toastCtrl: ToastController,
    public navParams: NavParams) {

  }

  addOrRemoveTextFields() {
    if ((this.itemFields[this.itemFields.length - 1].title || '').length > 0) {
      this.itemFields.push({});
    }
  }

  isFormValid() {
    if (this.inputType === 'recipe' && this.selectedRecipe && this.selectedRecipe.id) {
      return (this.selectedIngredients || []).length > 0;
    }
    if (this.inputType === 'items') {
      for (var i = 0; i < this.itemFields.length; i++) {
        if (this.itemFields[i].title) return true;
      }
    }
    return false;
  }

  save() {
    var items;
    if (this.inputType === 'recipe') {
      items = [];
      for (var i = 0; i < this.selectedIngredients.length; i++) {
        items.push({
          title: this.selectedIngredients[i],
          recipeId: this.selectedRecipe.id
        });
      }
    } else {
      // Redundant for now. Kept for sterilization
      items = this.itemFields.filter(function(e){
        return (e.title || '').length > 0;
      }).map(function(e) {
        return {
          title: e.title
        };
      });
    }

    this.viewCtrl.dismiss({
      destination: false,
      items: items
    });
  }

  cancel() {
    this.viewCtrl.dismiss({
      destination: false
    });
  }
}
