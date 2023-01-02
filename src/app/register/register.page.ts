import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RegisterPageForm } from './register.page.form';
import { ToastController} from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from '../shared/services/auth.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  banFoto = false;
  form: FormGroup;
  base64;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private authSvc: AuthService,
    private loadingCtrl: LoadingController,
    private router: Router
  ) { }

  ngOnInit() {
    //Validación de formulario de registro
    this.form = new RegisterPageForm(this.formBuilder).createForm();
  }

  async register() {
    //Si el formulario es valido conforme a los que devulve ReactiveForm, comenzar el registro
    if(this.form.valid){
      //Si se tomo la foto, continuar
      if(this.banFoto) {
 
        //Guadar los datos en el servidor
        let formRegData = {
          nombre : this.form.value.nombre.trim(),
          fechaNacimiento : this.form.value.fechaNaci.split('T')[0],
          estado : this.form.value.estado.trim(),
          genero : this.form.value.genero.trim(),
          telefono : this.form.value.telefono.trim(),
          base64image : this.base64
        }

        await this.presentLoading('Registrandose...');

        this.authSvc.register(formRegData)
          .subscribe(
            async res => {

              this.loadingCtrl.dismiss();

              let userData = res['data'];

              //Guadar los datos del nuevo usuario en localStorage
              localStorage.setItem('id', userData.id.toString());
              localStorage.setItem('rol', userData.rol);
              localStorage.setItem('nombre', userData.nombreCompleto);
              //Redirifir a la pagina
              if(userData.rol == 'chofer'){
                this.router.navigate(['/chofer-tabs'], { replaceUrl: true });
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

      } else {
        const toast = await this.toastController.create({
          message: 'Es necesario tomar su foto de perfil.',
          duration: 3000,
          position: 'bottom'
        });
        await toast.present();
      }

    } else {
      const toast = await this.toastController.create({
        message: 'Porfavor, verifique sus datos.',
        duration: 3000,
        position: 'bottom'
      });
      await toast.present();
    }
  }

  //Funcion para captura la foto
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source : CameraSource.Camera
      });
      // Here you get the image as result.
      this.base64 = image.base64String;
      this.banFoto = true;

    } catch (error) {
      this.banFoto = false;
    }
  }

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner : 'circles'
    });
    return await loading.present();
  }

}
