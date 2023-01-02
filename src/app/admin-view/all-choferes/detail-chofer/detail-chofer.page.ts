import { Component, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { DocsService } from 'src/app/shared/services/docs.service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { ToastController, LoadingController } from '@ionic/angular';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';
import { AllAttendances } from 'src/app/shared/interfaces/attendance.interface';

@Component({
  selector: 'app-detail-chofer',
  templateUrl: './detail-chofer.page.html',
  styleUrls: ['./detail-chofer.page.scss'],
})
export class DetailChoferPage implements OnInit, ViewWillEnter {

  public apiUrl = environment.api_url;

  public nombre: string;
  public clave: string;
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
  public estatus: string;
  public verVideo: string;
  public contestarQuiz: string;
  public subirDocs: string;

  public documentList;

  isModalOpen = false;
  isModalAsistenciaOpen = false;
  public userId;

  public downloadProgress = 0;

  public asistencias;

  constructor(
    private route: ActivatedRoute,
    private userSvc: UserService,
    private docsSvc: DocsService,
    private http: HttpClient,
    private plt: Platform,
    private fileOpener: FileOpener,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private asistenciaSvc: AsistenciaService,
    private toastCtrl: ToastController
  ) { }
  

  ngOnInit() {
  }

  ionViewWillEnter(): void {
    //Obtener el ID de chofer pasado por medio la ruta
    this.userId = this.route.snapshot.paramMap.get('idUser');
    //Obtener el detalle del chofer
    this.getDetailChofer(this.userId);
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
        },
        (error) => {
          this.loadingCtrl.dismiss();
        }
      )
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
    }
  }

  async descargarArchivo(url: string) {
    await this.presentLoading('Descargando archivo...');
    //Descargar el archivo a partir de la url y obtenerlo desde el servidor
    if(url !== undefined && url !== '') {
      //Comenzar con la descarga del archivo desde el servidor
      this.http.get(`${this.apiUrl}/document/download?url=${url}`, {
        responseType: 'blob',
        reportProgress: true,
        observe: 'events',
      }).subscribe(async event => {
        if(event.type === HttpEventType.DownloadProgress) {
          this.downloadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response){
          this.downloadProgress = 0;

          //Obtener el nombre
          const name = url.substring(url.lastIndexOf('/') + 1);

          //Verificar si es desde el navegador o movil
          if(this.plt.is('cordova')) {
            const base64 = await this.convertBlobToBase64(event.body) as string;

            try {
               //Escribir el archivo en el sistema o en el movil
              const savedFile = await Filesystem.writeFile({
                path: name,
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
              const toast = await this.toastController.create({
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
            a.download = name;
            a.click();
            URL.revokeObjectURL(objectUrl);
          }  
        }
      }, async error => {
        this.loadingCtrl.dismiss();

        const toast = await this.toastCtrl.create({
          message: 'Archivo no encontrado.',
          duration: 1500,
          position: 'bottom'
        });
        await toast.present();
      });
    }
  }

  consultarMovi() {
    //Consultar los movimientos de entrada y salida del chofer
    this.asistenciaSvc.getAllAttendances(this.userId)
      .subscribe((res) => {
        let data = res['data'];
        this.isModalAsistenciaOpen = true;
        this.asistencias = data;
      },
      (error) => {

      });
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }
  setOpenAsistencia(isOpen: boolean) {
    this.isModalAsistenciaOpen = isOpen;
  }

  openDocs() {
    //Consultar su documentación
    this.docsSvc.getDocuments(this.userId)
      .subscribe(
        (res) => {
          this.documentList = res['data'];

          this.isModalOpen = true;
        },
        (error) => {

        }
      )
  }

  onWillDismiss(event: Event) {
    this.isModalOpen = false;
  }

  onWillDismissAsistencia(event: Event) {
    this.isModalAsistenciaOpen= false;
  }

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner : 'circles'
    });
    return await loading.present();
  }

}
