import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoginPageForm } from './login.page.form';
import { AuthService } from '../shared/services/auth.service';
import { ToastController, LoadingController, ViewWillEnter } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit{

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder, 
    private authSvc: AuthService,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private router: Router) { }


  ngOnInit() {
    //Validacion de formulario
    this.form = new LoginPageForm(this.formBuilder).createForm();
  }

  async login() {
    await this.presentLoading('Iniciando sesión...');

    //Llamar al servicio que hace la peticion POST para el login y enviar los datos del formulario
    this.authSvc.login(this.form.value)
      .subscribe(
        async res => {

          let userData = res['data'];
          let msg = res['msg'];

          this.loadingCtrl.dismiss();

          const toast = await this.toastController.create({
            message: msg,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();

          //Guadar los valores en localStorage
          localStorage.setItem('id', userData.id.toString());
          localStorage.setItem('rol', userData.rol);
          localStorage.setItem('nombre', userData.nombreCompleto);
          if(userData.rol == 'chofer'){
            this.router.navigate(['/chofer-tabs'], { replaceUrl: true });
          }
          if(userData.rol == 'admin' || userData.rol === 'seguridad' || userData.rol === 'vigilancia' || userData.rol === 'logistica'){
            this.router.navigate(['/admin-tabs'], { replaceUrl: true });
          }
        },
        async error => {
          this.loadingCtrl.dismiss();
          
          //Mostrar mensaje de error en Toast
          const toast = await this.toastController.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
          this.form.reset();
        }
      );
  }

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner : 'circles'
    });
    return await loading.present();
  }
}
