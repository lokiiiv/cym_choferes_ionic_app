import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BackButtonService } from './shared/services/back-button.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private backButtonSvc: BackButtonService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.backButtonSvc.init();
    });
  }
}
