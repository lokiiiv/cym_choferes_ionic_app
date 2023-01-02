import { Component, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { UserService } from 'src/app/shared/services/user.service';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.page.html',
  styleUrls: ['./add-user.page.scss'],
})
export class AddUserPage implements OnInit, ViewWillEnter {

  public users;
  public searchedUsuario;
  isModalOpen = false;
  editing = false;

  public idUsuario;

  public myForm: FormGroup;

  constructor(
    private userSvc: UserService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private fb: FormBuilder
  ) { }

  ionViewWillEnter(): void {
    this.obtenerNoChoferes();
  }

  ngOnInit() {
    this.myForm = this.fb.group({
      nombreCompleto: new FormControl('', [Validators.required]),
      rol: new FormControl('', [!this.editing ? Validators.required : Validators.nullValidator])
    });
  }

  async obtenerNoChoferes() {
    await this.presentLoading('Buscando...');
    //Obtener todos los usuarios que no son choferes
    this.userSvc.getNoChoferes()
      .subscribe(
        res => {
          this.users = res['data'];
          this.searchedUsuario = this.users;
          //console.log(res['data']);
          this.loadingCtrl.dismiss();
        },
        error => {
          this.loadingCtrl.dismiss();
        }
      )
  }

  searchUsuario(event) {
    const text = event.target.value;
    this.searchedUsuario = this.users;
    if (text && text.trim() != '') {
      this.searchedUsuario = this.searchedUsuario.filter((user: any) => {
        return (user.nombreCompleto.toLowerCase().indexOf(text.toLowerCase()) > -1
          || user.clave.toLowerCase().indexOf(text.toLowerCase()) > -1
          || user.rol.toLowerCase().indexOf(text.toLowerCase()) > -1)
      });
    }
  }

  nuevoUsuario() {
    this.isModalOpen = true;
    this.editing = false;
    this.myForm.reset();
  }

  async guardarEditarUsuario() {

    //Verificar si se desea guardar o editar el usuario
    if (this.editing) {
      //Si esta en modo de edicion de usuario...
      await this.presentLoading('Actualizando...');
      this.userSvc.editUser(this.idUsuario, this.myForm.value)
        .subscribe(
          async (res) => {

            this.loadingCtrl.dismiss();
            this.myForm.reset();
            this.isModalOpen = false;
            this.editing = false;

            const toast = await this.toastCtrl.create({
              message: res['msg'],
              duration: 1500,
              position: 'bottom'
            });
            await toast.present();
          },
          async (error) => {

            this.loadingCtrl.dismiss();

            const toast = await this.toastCtrl.create({
              message: error,
              duration: 1500,
              position: 'bottom'
            });
            await toast.present();
          }
        )

    } else {
      //cuando los datos ingresados sena validos, proceder a guardar al usuario

      await this.presentLoading('Guardando...');
      this.userSvc.addNoChofer(this.myForm.value)
        .subscribe(
          async (res) => {
            this.loadingCtrl.dismiss();
            this.myForm.reset();
            this.isModalOpen = false;

            const toast = await this.toastCtrl.create({
              message: res['msg'],
              duration: 1500,
              position: 'bottom'
            });
            await toast.present();

          },
          async (error) => {
            this.loadingCtrl.dismiss();
            this.myForm.reset();
            this.isModalOpen = false;

            const toast = await this.toastCtrl.create({
              message: error,
              duration: 1500,
              position: 'bottom'
            });
            await toast.present();
          }
        )
    }
  }

  obtenerUsuario(idUser) {
    //Obtener la información del usuario por su id
    this.idUsuario = idUser;

    this.editing = true;
    this.userSvc.getUserById(idUser)
      .subscribe(
        (res) => {
          this.isModalOpen = true;
          //Llenar el formulario del modal con los datos obtenido del usuario
          this.myForm.patchValue(res['data']);
        },
        (error) => {

        }
      )
  }

  async eliminarUsuario(idUser, nombre) {
    //Verificar si no se quiere eliminar a uno mismos
    if (parseInt(localStorage.getItem('id')) === idUser) {
      const alert = await this.alertCtrl.create({
        header: 'Aviso',
        message: 'No puedes eliminar este usuario, este usuario está actualmente activo en la aplicación.',
        buttons: [
          {
            text: 'Ok'
          }
        ]
      });
      await alert.present();
    } else {

      const alert = await this.alertCtrl.create({
        header: 'Aviso',
        message: '¿Está seguro de eliminar al usuario ' + nombre + '?',
        buttons: [
          {
            text: 'Cancelar'
          },
          {
            text: 'Aceptar',
            handler: async () => {
              await this.presentLoading('Eliminando...');
              this.userSvc.deleteUser(idUser)
                .subscribe(
                  async (res) => {

                    this.loadingCtrl.dismiss();
                    this.obtenerNoChoferes();

                    const toast = await this.toastCtrl.create({
                      message: res['msg'],
                      duration: 1500,
                      position: 'bottom'
                    });
                    await toast.present();
                  },
                  async (error) => {

                    this.loadingCtrl.dismiss();
                    const toast = await this.toastCtrl.create({
                      message: error,
                      duration: 1500,
                      position: 'bottom'
                    });
                    await toast.present();
                  }
                );
            }
          }
        ]
      });

      await alert.present();
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  onWillDismiss(event: Event) {
    this.isModalOpen = false;
    this.obtenerNoChoferes();
  }

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner: 'circles'
    });
    return await loading.present();
  }

}
