import { Component, OnInit } from '@angular/core';
import { LoadingController, Platform, ViewWillEnter } from '@ionic/angular';
import { ItemUser } from 'src/app/shared/interfaces/user.interface';
import { UserService } from 'src/app/shared/services/user.service';
import { environment } from 'src/environments/environment';
import { AlertController, ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

@Component({
  selector: 'app-all-choferes',
  templateUrl: './all-choferes.page.html',
  styleUrls: ['./all-choferes.page.scss'],
})
export class AllChoferesPage implements OnInit, ViewWillEnter {

  public users;
  public searchedChofer;

  public foto: string;
  public estatus: string;
  public nombre: string;
  public empresa: string;
  public idUser: number;

  public apiUrl = environment.api_url;

  isModalOpen = false;
  isModalVigenciaOpen = false;

  public documentosVencidos;

  public downloadProgress = 0;
  
  constructor(
    private userSvc: UserService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private http: HttpClient,
    private plt: Platform,
    private fileOpener: FileOpener
  ) { }
  

  ngOnInit() {
  }

  ionViewWillEnter(): void {
    this.getAllChoferes();
  }

  async getAllChoferes(){
    await this.presentLoading('Buscando...');
    this.userSvc.getAllBasicChoferes()
      .subscribe(
        (res) => {
          this.users = res['data'];
          this.searchedChofer = this.users;
          this.loadingCtrl.dismiss();
        },
        (error) => {
          this.loadingCtrl.dismiss();
        }
      )
  }

  cambiarEstatus(idUser: number) {
    //Obtener el estatus actual del chofer
    this.getStatusChofer(idUser);
  }

  getStatusChofer(idUser){
    this.userSvc.getStatusChofer(idUser)
      .subscribe(
        (res) => {
          let data = res['data'];
          this.foto = data.foto;
          this.estatus = data.estatus;
          this.nombre = data.nombreCompleto;
          this.empresa = data.empresaTransportista;
          this.idUser = idUser;

          //Abrir el modal para mostrar estatus y cambiarlo si es necesario
          this.isModalOpen = true;
        },
        (error) => {

        }
      )
  }

  searchChofer(event) {
    const text = event.target.value;
    this.searchedChofer = this.users;
    if(text && text.trim() != '') {
      this.searchedChofer = this.searchedChofer.filter((user: ItemUser) => {
        return (user.nombreCompleto.toLowerCase().indexOf(text.toLowerCase()) > -1)
      });
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  setVigenciaOpen(isOpen: boolean) {
    this.isModalVigenciaOpen = isOpen;
  }

  onWillDismiss(event: Event) {
    this.isModalOpen = false;
    this.getAllChoferes();
  }

  onWillVigenciaDismiss(event: Event) {
    this.isModalVigenciaOpen = false;
    this.getAllChoferes();
  }


  consultarVigencias(){
    //Obtener los choferes que ya tenga algun fecha de documtacion vencida
    this.userSvc.getChoferVencidos()
      .subscribe(
        (res) => {
          console.log(res);
          this.isModalVigenciaOpen = true;
          this.documentosVencidos = res['data'];
        }
      )
  }

  async deshabilitar() {
    const alert = await this.alertCtrl.create({
      header: 'Deshabilitar usuario',
      subHeader: 'Ingrese la razón o motivo por la cual es chofer será deshabilitado o vetado.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Deshabilitar',
          role: 'confirm',
          handler: async (alertData) => {
            if(alertData.txtRazon !== '') {
              //Actualizar el estatus de un chofer
              this.userSvc.deshabilitarChofer(this.idUser, { motivo: alertData.txtRazon})
                .subscribe(
                  async (res) => {
                    if(res['res']) {
                      const toast = await this.toastCtrl.create({
                        message: res['msg'],
                        duration: 2000,
                        position: 'bottom'
                      });
                      await toast.present();
                      this.isModalOpen = false;
                      this.getAllChoferes();
                    }
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
            } else {
              const toast = await this.toastCtrl.create({
                message: '¡Ingrese los datos!',
                duration: 1500,
                position: 'bottom'
              });
              await toast.present();
            }
          }
        }
      ],
      inputs: [
        {
          name: 'txtRazon',
          type: 'textarea',
          placeholder: 'Razón o motivo.'
        }
      ]
    });
    await alert.present();
  }

  async habilitar() {
    const alert = await this.alertCtrl.create({
      header: 'Aviso',
      message : '¿Esta seguro de habilitar al chofer seleccionado?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Habilitar',
          role: 'confirm',
          handler: () => {
            this.userSvc.habilitarChofer(this.idUser)
              .subscribe(
                async (res) => {
                  if(res['res']) {
                    const toast = await this.toastCtrl.create({
                      message: res['msg'],
                      duration: 2000,
                      position: 'bottom'
                    });
                    await toast.present();
                    this.isModalOpen = false;
                    this.getAllChoferes();
                  }
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
        }
      ]
    });
    await alert.present();
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    }
    reader.readAsDataURL(blob);
  });

  private getMimeType(name) {
    if(name.indexOf('pdf') >= 0) {
      return 'application/pdf';
    } else if (name.indexOf('png') >= 0) {
      return 'image/png';
    } else if (name.indexOf('jpeg') >= 0) {
      return 'image/jpeg'
    } else if (name.indexOf('xlsx') >= 0) {
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
  }

  async downloadAsistencias() {
    await this.presentLoading('Generando archivo...');
    this.http.get(`${this.apiUrl}/ruta/download`, {
      responseType: 'blob',
      reportProgress: true,
      observe: 'events'
    }).subscribe(async event => {
      if(event.type === HttpEventType.DownloadProgress) {
        this.downloadProgress = Math.round((100 * event.loaded) / event.total);
      } else if (event.type === HttpEventType.Response){
        this.downloadProgress = 0;

        console.log(event.body);

        //Verificar si es desde el navegador o movil
        if(this.plt.is('cordova')) {
          const base64 = await this.convertBlobToBase64(event.body) as string;
          try {
            //Escribir el archivo en el sistema o en el movil
            const savedFile = await Filesystem.writeFile({
              path: 'lista_asistencia_choferes.xlsx',
              data: base64,
              directory: Directory.Documents
            });

            this.loadingCtrl.dismiss();

            const path = savedFile.uri;
            const mimeType = this.getMimeType(name);
            this.fileOpener.open(path, mimeType);
          } catch (error) {
            this.loadingCtrl.dismiss();
            //Mostrar mensaje de error en Toast
            const toast = await this.toastCtrl.create({
              message: error,
              duration: 2000,
              position: 'bottom'
            });
            await toast.present();
          }

        } else {
          this.loadingCtrl.dismiss();
          //Descargar de manera normal estando en el navegador
          const a = document.createElement('a')
          const objectUrl = URL.createObjectURL(event.body)
          a.href = objectUrl
          a.download = 'lista_asistencia_choferes.xlsx';
          a.click();
          URL.revokeObjectURL(objectUrl);
        }  
      }
    }, async error => {
      this.loadingCtrl.dismiss();

        const toast = await this.toastCtrl.create({
          message: 'Error al generar el archivo.',
          duration: 1500,
          position: 'bottom'
        });
        await toast.present();
    });
  }

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner : 'circles'
    });
    return await loading.present();
  }

}
