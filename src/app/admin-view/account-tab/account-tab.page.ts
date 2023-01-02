import { Component, OnInit } from '@angular/core';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoadingController } from '@ionic/angular';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-account-tab',
  templateUrl: './account-tab.page.html',
  styleUrls: ['./account-tab.page.scss'],
})
export class AccountTabPage implements OnInit, ViewWillEnter {

  nombre: string;
  clave: string;
  rol: string;
  fotoUrl: string;

  constructor(
    private loadingCtrl: LoadingController,
    private userSvc: UserService,
    private toastCtrl: ToastController,
    private authSvc: AuthService,
  ) { }

  ionViewWillEnter(): void {
    this.getBasicAdmin();
  }

  async getBasicAdmin(){
    await this.presentLoading('Cargando...');
    this.userSvc.getBasicAdmin(localStorage.getItem('id'), {rol: localStorage.getItem('rol')})
      .subscribe(
        async res => {
          let info = res['data'];
          this.nombre = info.nombreCompleto;
          this.clave = info.clave;
          this.rol = info.rol;
          this.fotoUrl = info.foto;

          this.loadingCtrl.dismiss();
        },
        async error => {
          this.loadingCtrl.dismiss();

          //Mostrar mensaje de error en Toast
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      );
  }

  ngOnInit() {
  }

  logout(){
    this.authSvc.logout();
  }

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner : 'circles'
    });
    return await loading.present();
  }
}
