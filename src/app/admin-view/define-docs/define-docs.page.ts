import { Component, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { DocsService } from 'src/app/shared/services/docs.service';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-define-docs',
  templateUrl: './define-docs.page.html',
  styleUrls: ['./define-docs.page.scss'],
})
export class DefineDocsPage implements OnInit, ViewWillEnter {

  public documentos;
  isModalOpen = false;
  public tipo_doc;
  public nombre_doc;
  public verificarVigencia = true;

  mostrarCheckBox = false;

  constructor(
    private documentSvc: DocsService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertController: AlertController
  ) { }

  ionViewWillEnter(): void {
    this.obtenerDocumentosDisponibles();
  }

  async obtenerDocumentosDisponibles(){
    await this.presentLoading('Buscando...');
    this.documentSvc.getDocumentosDisponibles()
      .subscribe(
        (res) => {
          this.documentos = res['data'];
          this.loadingCtrl.dismiss();
        }, 
        (error) => {

          this.loadingCtrl.dismiss();
        }
      )
  }

  nuevoDocumento(){
    this.isModalOpen = true;
  }

  async registrarDocumento() {
    //Guardar que tipo de documento se debe subir
    if(this.nombre_doc != undefined && this.tipo_doc != undefined) {
      let body = {
        tipo : this.tipo_doc,
        nombre : this.nombre_doc,
        isVigente : this.verificarVigencia
      };
      this.tipo_doc = '';
      this.nombre_doc = '';
      await this.presentLoading('Buscando...');
      this.documentSvc.nuevoDoc(body)
        .subscribe(
          async (res) => {
            this.loadingCtrl.dismiss();
            this.isModalOpen = false;
            const toast = await this.toastCtrl.create({
              message: res['msg'],
              duration: 2000,
              position: 'bottom'
            });
            await toast.present();
          },
          async (error) => {
            this.loadingCtrl.dismiss();
            this.isModalOpen = false;
            const toast = await this.toastCtrl.create({
              message: error,
              duration: 2000,
              position: 'bottom'
            });
            await toast.present();
          }
        )
    } else {
      //Mostrar mensaje de error en Toast
      const toast = await this.toastCtrl.create({
        message: '¡Ingrese todos los datos!',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
    }
  }

  async eliminarDoc(idDoc) {
    const alert = await this.alertController.create({
      header: 'Aviso',
      message: 'Al eliminar este documento, también se eliminaran los archivos de este documento que haya subido el chófer.',
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.eliminarDocumento(idDoc);
          }
        }
      ]
    });

    await alert.present();
  }

  eliminarDocumento(idDoc) {
    this.documentSvc.eliminarDocumento(idDoc)
      .subscribe(
        async (res) => {
          const toast = await this.toastCtrl.create({
            message: res['msg'],
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
          this.obtenerDocumentosDisponibles();
        },
        async (error) => {
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  tipoChange(event) {
    if(event.target.value == 'date') {
      this.mostrarCheckBox = true;
    } else {
      this.mostrarCheckBox = false;
    }
  }

  ngOnInit() {
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  onWillDismiss(event: Event) {
    this.isModalOpen = false;
    this.obtenerDocumentosDisponibles();
  }

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner : 'circles'
    });
    return await loading.present();
  }
}
