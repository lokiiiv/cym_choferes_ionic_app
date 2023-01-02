import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class BackButtonService {

  private lastTimeBackButtonWasPressed = 0;
  private timePeriodToAction = 2000;

  constructor(
    private platform: Platform,
    private router: Router,
    private navController: NavController,
    private toastCtrl: ToastController
  ) { }

  init() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const currentUrl = this.router.url;
      if(currentUrl === '/chofer-tabs/main' || currentUrl === '/admin-tabs/main' || currentUrl === '/chofer-tabs/account' || currentUrl === '/admin-tabs/account' || currentUrl === '/' || currentUrl === '/login'){
        this.withDoublePress('Presione nuevamente para salir.', () => {
          navigator['app'].exitApp();
        });
      } else {
        this.navController.back();
      }
    });
  }

  async withDoublePress(message: string, action: () => void) {
    const currentTime = new Date().getTime();

    if(currentTime - this.lastTimeBackButtonWasPressed < this.timePeriodToAction) {
      action();
    } else {
      const toast = await this.toastCtrl.create({
        message: message,
        duration: this.timePeriodToAction
      });
      await toast.present();
      this.lastTimeBackButtonWasPressed = currentTime;
    }
  }
}
