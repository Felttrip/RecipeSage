import { Injectable } from '@angular/core';

import { LoadingBarService } from '@ngx-loading-bar/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  REQUEST_COMPLETE_DELAY = 150;

  constructor(private loadingBar: LoadingBarService) {}

  start() {
    this.loadingBar.start();

    return {
      dismiss: () => {
        setTimeout(() => {
          this.loadingBar.complete();
        }, this.REQUEST_COMPLETE_DELAY);
      }
    };
  }
}
