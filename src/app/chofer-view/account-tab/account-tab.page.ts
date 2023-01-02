import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-account-tab',
  templateUrl: './account-tab.page.html',
  styleUrls: ['./account-tab.page.scss'],
})
export class AccountTabPage implements OnInit, ViewWillEnter {

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private userSvc: UserService,
    private authSvc: AuthService
  ) { }

  nombre: string;
  clave: string;
  fotoUrl: string;
  estatus: string;

  public rol: string;
  public fechaNacimiento: string;
  public edad: number;
  public fechaRegistro: string;
  public genero: string;
  public empresa: string;
  public estado: string;
  public foto: string;
  public telefono: string;
  public telContacto: string;
  public verVideo: string;
  public contestarQuiz: string;
  public subirDocs: string;

  isModalOpen = false;
  

  ngOnInit() {
  }

  ionViewWillEnter(): void {
    this.getBasicChofer();
  }

  async getBasicChofer(){
    await this.presentLoading('Cargando...');
    this.userSvc.getBasicChofer(localStorage.getItem('id'))
      .subscribe(
        async res => {
          let info = res['data'];
          this.nombre = info.nombreCompleto;
          this.clave = info.clave;
          this.fotoUrl = info.foto;
          this.estatus = info.estatus;

          this.loadingCtrl.dismiss();
        },
        async error => {
          this.loadingCtrl.dismiss();

          //Mostrar mensaje de error en Toast
          const toast = await this.toastCtrl.create({
            message: 'Error al obtener información del servidor.',
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      );
  }

  async getDetailChofer(userId) {
    await this.presentLoading('Mostrando...');
    this.userSvc.getDetailChofer(userId)
      .subscribe(
        (res) => {
          let data = res['data'];
          this.nombre = data.nombreCompleto;
          this.clave = data.clave;
          this.rol = data.rol;
          this.fechaNacimiento = data.fechaNacimiento;
          this.edad = data.edad;
          this.fechaRegistro = data.fechaRegistro;
          this.genero = data.genero;
          this.empresa = data.empresaTransportista;
          this.estado = data.estadoProcedencia;
          this.foto = data.foto;
          this.telefono = data.telefonoCelular;
          this.telContacto = data.telefonoContactoEmpresa;
          this.estatus = data.estatus;
          this.verVideo = data.verVideo;
          this.contestarQuiz = data.contestarQuiz;
          this.subirDocs = data.subirDocs;
          this.loadingCtrl.dismiss();

          this.isModalOpen = true;
        },
        (error) => {
          this.loadingCtrl.dismiss();
        }
      )
  }

  detailChofer(){
    this.getDetailChofer(localStorage.getItem('id'));
  }

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner : 'circles'
    });
    return await loading.present();
  }

  onWillDismiss(event: Event) {
    this.isModalOpen = false;
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  logout(){
    this.authSvc.logout();
  }

}
