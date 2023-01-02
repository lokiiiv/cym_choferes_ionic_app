import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { environment } from 'src/environments/environment';
import { ModalController, ToastController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ModalqrComponent } from '../modalqr/modalqr.component';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';

import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { LoadingController } from '@ionic/angular';
import { forkJoin } from 'rxjs'

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-main-tab',
  templateUrl: './main-tab.page.html',
  styleUrls: ['./main-tab.page.scss'],
})
export class MainTabPage implements OnInit, ViewWillEnter {

  public isWatchVideo;
  public isAnswerQuiz;
  public isUploadDocs;

  public requeComplete;


  public nombre: string;
  public clave: string;
  public empresa: string;
  public fotoUrl: string;
  public estatus: string;
  public lastQuizDate: string;
  public proximoQuiz: string;
  public diasRestantes: number;

  
  public apiURL = environment.api_url;

  public qrValue = localStorage.getItem('id');

  public banEntrada: boolean;
  public banSalida: boolean;

  public pdfObj = null;

  constructor(
    private userSvc: UserService,
    private asistenciaSvc: AsistenciaService,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private router: Router,
    private plt: Platform,
    private fileOpener: FileOpener,
    private loadingCtrl: LoadingController) { }


  ngOnInit() {
    
  }

  ionViewWillEnter(): void {
    //Cuando se cargue la vista, llamar a la api para verificar requerimientos, info de chofer y ultimas asistencias
    //this.verificarRequerimientos();
    //this.getBasicChofer();
    //this.getLastAttendance();
    this.cargarInformacion();
  }

  async cargarInformacion(){
    let checkRequerimientos = this.userSvc.verificarRequerimientos(localStorage.getItem('id'));
    let infoBasicChofer = this.userSvc.getBasicChofer(localStorage.getItem('id'));
    //let lastAttendance = this.asistenciaSvc.getLastAttendance(localStorage.getItem('id'));

    await this.presentLoading('Cargando...');
    forkJoin([checkRequerimientos, infoBasicChofer]).subscribe(
      (res) => {
        console.log(res);
        //Obtener los requerimientos
        let requerimientos = res[0]['data'];
        this.isWatchVideo = requerimientos.verVideo;
        this.isAnswerQuiz = requerimientos.contestarQuiz;
        this.isUploadDocs = requerimientos.subirDocs;
        if(this.isWatchVideo === 1 && this.isAnswerQuiz === 1 && this.isUploadDocs === 1) {
          this.requeComplete = true;
        } else {
          this.requeComplete = false;
        }

        //Obtener información basica del chofer
        let info = res[1]['data'];
        this.nombre = info.nombreCompleto;
        this.clave = info.clave;
        this.empresa = info.empresaTransportista;
        this.fotoUrl = info.foto;
        this.estatus = info.estatus;
        this.lastQuizDate = info.lastQuizDate;
        this.proximoQuiz = info.proximoQuiz;
        this.diasRestantes = info.diasRestantes;

        //Consultar cual fue la ultima asistencia, si fue entrada o salida
        //Dependiendo a eso, mostrar la opcion de generar entrada o generar salida
        //Obtener cual fue su ultima asistencia
        // const last_att = res[2]['data'];
        //  //Si no retorna nada, quiere decir que el chofer aun no ha registrado asistencia
        //  if (last_att === null) {
        //   //Por ende, se le debe permitir registrar la entrada y deshabilitar la salida
        //   this.banEntrada = true;
        //   this.banSalida = false;
        // } else {
        //   //Si ya tiene asistencias registradas, verificar si fue una entrada o una salida.
        //   if (last_att.att_type == 'IN') {
        //     this.banEntrada = false;
        //     this.banSalida = true;
        //   } else {
        //     if (last_att.att_type == 'OUT') {
        //       this.banSalida = false;
        //       this.banEntrada = true;
        //     }
        //   }
        // }

        this.loadingCtrl.dismiss();
      }, 
      async (error) => {

        this.loadingCtrl.dismiss();
        
        //Mostrar mensaje de error en Toast
        const toast = await this.toastController.create({
          message: 'Error al obtener información del servidor.',
          duration: 2000,
          position: 'bottom'
        });
        await toast.present();
      }
    )
  }

  goToQuiz(){
    this.router.navigate(['/chofer-tabs/main/quiz']);
  }

  goToVideo(){
    this.router.navigate(['/chofer-tabs/main/video']);
  }

  goToDocs(){
    this.router.navigate(['/chofer-tabs/main/docs']);
  }

  
  getLastAttendance() {
    this.asistenciaSvc.getLastAttendance(localStorage.getItem('id'))
      .subscribe(
        (res) => {
          const last_att = res['data'];
          //Si no retorna nada, quiere decir que el chofer aun no ha registrado asistencia
          if (last_att === null) {
            //Por ende, se le debe permitir registrar la entrada y deshabilitar la salida
            this.banEntrada = true;
            this.banSalida = false;
          } else {
            //Si ya tiene asistencias registradas, verificar si fue una entrada o una salida.
            if (last_att.att_type == 'IN') {
              this.banEntrada = false;
              this.banSalida = true;
            } else {
              if (last_att.att_type == 'OUT') {
                this.banSalida = false;
                this.banEntrada = true;
              }
            }
          }
        },
        (error) => {

        }
      )
  }

  async openQrModal() {
    //Al abrir el modal, asignar valor al codigo QR para entrada

    const modal = await this.modalCtrl.create({
      component: ModalqrComponent,
      componentProps: {
        qrValue: this.qrValue,
      }
    });
    modal.present();
  }

  //Metodo para obtener las imagenes de los codigos QR y generar un PDF para descargar
  async downloadCodes(qr){
    await this.presentLoading('Generando archivo...');
    //Obtener la imagen en base64 desde el elemento de los QR en la vista
    const qrElement = qr.qrcElement.nativeElement.querySelector('img').src;

    //Comenzar a generar el PDF
    var dd = {
      pageSize : 'LETTER',
      content: [
          {
            columns: [
	            {
	              width: 120,
                image: await this.getBase64ImageFromURL('./assets/image/logo.png'),
                fit: [100, 100]
              },
              {
                  width: 110,
                  image: await this.getBase64ImageFromURL('./assets/image/cym_logo.png'),
                  fit: [70, 70]
              },
              {
                  text: 'Cebadas y Maltas S. de R.L de C.V',
                  alignment: 'right'
              }
			      ]
          },
        {
          text: [
            'Pase para registro de movimientos dentro de Cebadas y Maltas S. de R.L de C.V.'
          ],
          style: 'header'
        },
        {
          text: `Chofer: ${localStorage.getItem('nombre')}`,
          style: 'titleChofer'
        },
        {
          text: [
            'Proporcione el codigo QR en los diferentes puntos de planta para registrar sus movimientos durante su recorrido en planta.',
          ]
        },
        {
            text : 'SU CÓDIGO QR:',
            style : 'titleQr'
        },
        {
            image : qrElement,
            alignment : 'center',
            fit : [230,230]
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'left',
          margin: [0, 10, 0, 5]
        },
        subheader: {
          fontSize: 14
        },
        superMargin: {
          margin: [20, 0, 40, 0],
          fontSize: 15
        },
        titleQr: {
            fontSize : 16,
            alignment: 'center',
            margin: [0, 30, 0, 0]
        },
        titleChofer: {
            fontSize: 16,
            margin: [0, 0, 0, 10]
        }
      }
    }
    
    this.pdfObj = pdfMake.createPdf(dd);
    //Verificar si si esta dentro de movil o web
    if(this.plt.is('cordova')){
      this.pdfObj.getBase64(async (data) => {
        try {
          //Guardar el PDF en el dispositivo
          await Filesystem.writeFile({
            path : `Pase_${localStorage.getItem('nombre')}_${localStorage.getItem('id')}.pdf`,
            data : data,
            directory : Directory.Documents
          }).then(async (writeFileResult) => {
            this.loadingCtrl.dismiss();
            //Si se escribio o guardo correctamente, abrir el archivo pdf
            this.fileOpener.open(`${writeFileResult.uri}`, 'application/pdf')
          })
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
      });
    } else {
      this.loadingCtrl.dismiss();
      //Si es en el navegador, descargar de forma normal el PDF
      this.pdfObj.download(`Pase_${localStorage.getItem('nombre')}_${localStorage.getItem('id')}.pdf`);
    }
    
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = error => {
        reject(error);
      };
      img.src = url;
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
