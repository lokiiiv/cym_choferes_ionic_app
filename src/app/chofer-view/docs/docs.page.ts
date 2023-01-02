import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { AlertController, LoadingController, ToastController, ViewWillEnter } from '@ionic/angular';
import { DocsService } from '../../shared/services/docs.service';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.page.html',
  styleUrls: ['./docs.page.scss'],
})
export class DocsPage implements OnInit, ViewWillEnter {

  public rutaINE: string;
  public rutaLicencia: string;
  public rutaPoliza: string;
  public rutaVacu: string;

  private fileINE;
  private fileLicencia;
  private filePoliza;
  private fileVacu;

  minDate;


  public elementosForm;
  myForm: FormGroup;

  public valorCamara;

  progressInfos: any[] = [];
  message: string[] = [];

  urlsFileUpload: Observable<any>[] = []; 


  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private docsSvc: DocsService,
    private userSvc: UserService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private fb: FormBuilder
  ) { 

    this.myForm = this.fb.group({});
  }

  ionViewWillEnter(): void {
    //Restablecer los valores en caso de ingresar o volver a ver el componente
    this.rutaINE = "";
    this.rutaLicencia = "";
    this.rutaPoliza = "";
    this.rutaVacu = "";

    this.fileINE = null;
    this.fileLicencia = null;
    this.filePoliza = null;
    this.fileVacu = null;

    //Cargar que documentos debe subir el chofer
    this.loadDocumentos();
  }

  ngOnInit() {
    //Definir la fecha minima a partir de la fecha actual para que el calendario solo muestre a partir de sa fecha
    this.minDate = new Date().toISOString().slice(0, 10);
  }


  loadDocumentos() {
    this.docsSvc.getDocumentos(localStorage.getItem('id'))
      .subscribe(
        (res) => {
          //Obtener la información de los documentos que debe subir el chofer, la cual incluye si ya se subieron
          console.log(res['data']);
          this.elementosForm = res['data'];
          this.createControls(this.elementosForm);
        },
        async (error) => {
          const toast = await this.toastCtrl.create({
            message: 'Error al cargar la información.',
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  createControls(controls) {
    //Generar los controles para el formulario dinamico
    for (let control of controls) {
      const newFromControl = new FormControl();
      //newFromControl.setValidators(Validators.required);

      this.myForm.addControl(control.metadata, newFromControl);

      //Si al consultar ya tiene un dato de fecha o texto en general, asignarlo
      if(control.tipo === 'date' || control.tipo === 'text') {
        if(control.valor) {
          this.myForm.controls[control.metadata].setValue(control.valor);
        }
      }
    }
  }

  async submitForm() {
    console.log(this.myForm.value);
    //Recorrer el JSON que incluye que documentos debe subir y verificar si se selecciono algun archivo para subir o actualizar
    
    let banFile = false;
    for (let i = 0; i < this.elementosForm.length; i++) {
      //Verificar si el usuario ya tiene el documento en la base de datos, si es null quiere decir que no lo ha subido
      if(this.elementosForm[i].valor == null) {
        //Verificar si el usuario ya selecciono ese documento o foto
        if(this.myForm.controls[this.elementosForm[i].metadata].value == null || this.myForm.controls[this.elementosForm[i].metadata].value == "") {
          
          const toast = await this.toastCtrl.create({
            message: 'Debe subir el siguiente documento: ' + this.elementosForm[i].nombre,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();

          banFile = false;

          break;
        } else {

          banFile = true;

        }
      } else {

        //Si el valor no es null, el usuario ya subio su documento, pero aun así es posible que pueda volver a subirlo por otro (actualizarlo)
        if(this.myForm.controls[this.elementosForm[i].metadata].value != null) {
          banFile = true;
        } 
      }
    }

    
    if(banFile) {
      for (let i = 0; i < this.elementosForm.length; i++) {
        if(this.elementosForm[i].valor == null) {
          //Si el documento aun no existe en el servidor, proceder a 
          let idUser = localStorage.getItem('id');
          let file = this.myForm.controls[this.elementosForm[i].metadata].value;
          let idDoc = this.elementosForm[i].idDocs;
          let tipoDoc = this.elementosForm[i].tipo;
          let nombre = this.elementosForm[i].metadata;
          let nombreChofer = localStorage.getItem('nombre').replace(/\s/g, "_");
          let nombreFile = this.elementosForm[i].nombre;

          this.uploadFile(i, idUser, file, idDoc, tipoDoc, nombre, nombreChofer, nombreFile);

        } else {
          //Si ya subio el documento, puede volver a subirlo o actualizarlo 
          if(this.myForm.controls[this.elementosForm[i].metadata].value !== null && this.myForm.controls[this.elementosForm[i].metadata].value !== ""){

            let idUser = localStorage.getItem('id');
            let file = this.myForm.controls[this.elementosForm[i].metadata].value;
            let idDoc = this.elementosForm[i].idDocs;
            let tipoDoc = this.elementosForm[i].tipo;
            let nombre = this.elementosForm[i].metadata;
            let nombreChofer = localStorage.getItem('nombre').replace(/\s/g, "_");
            let nombreFile = this.elementosForm[i].nombre;

            this.uploadFile(i, idUser, file, idDoc, tipoDoc, nombre, nombreChofer, nombreFile);
          }
        }
      }

      //console.log('Lista de observables para subir los archivos o datos: ', this.urlsFileUpload);
      
      //Ejecutar todos las peticiones para subir cada archivo en paralelo
      await this.presentLoading('Cargando...');

      forkJoin(this.urlsFileUpload).subscribe(
        async (res) => {
          this.loadingCtrl.dismiss();

          //Resetear la variable auxiliar, el formulario y la lista de observables
          //Volver a cargar los documentos disponibles del chofer
          banFile = false;
          this.myForm.reset();
          this.urlsFileUpload = [];
          this.loadDocumentos();


          console.log(res);

          this.setUploadDocs();
          
        },
        async (error) => {

          this.loadingCtrl.dismiss();

          const toast = await this.toastCtrl.create({
            message: 'Error al subir algún archivo al servidor.',
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();

          banFile = false;
          this.myForm.reset();
          this.urlsFileUpload = [];
          this.loadDocumentos();
        }
      )
    } 
  }

  uploadFile(idx, idUser, file, idDoc, tipoDoc, nombreDoc, nombreChofer, nombreFile){
    //Llamar al servicio para proceder a subir el documento al servidor
    const formData = new FormData();
    formData.append('idUser', idUser);
    formData.append('file', file);
    formData.append('idDoc', idDoc);
    formData.append('tipoDoc', tipoDoc);
    formData.append('nombre', nombreDoc);
    formData.append('nameUser', nombreChofer);
    formData.append('nombreFile', nombreFile);

    //Agregar a la lista el observable para subir el archivo para usarlo posteriormente con un forkjoin
    this.urlsFileUpload.push(this.docsSvc.uploadDocs(formData));
  }


  //Metodo que se ejecuta cuando se elige capturar una foto de la camara
  async takeDoc(nombreControl: string, buttonEvent) {
    try {
      //Comenzar a capturar la imagen
      const image = await Camera.getPhoto({
        quality : 50,
        allowEditing : false,
        resultType : CameraResultType.Uri,
        source : CameraSource.Camera
      });

      if(image) {
        //Convertir la imagen en un File
        const imagen = await fetch(image.webPath);
        let file = await imagen.blob();
        file = new File([file], nombreControl + '.png', {type: "image/png"});

        //Asignar al control del archivo la ruta de la imagen que se capturo con la camara
        this.myForm.controls[nombreControl].patchValue(file);

        //Mostrar la etiqueta que indica que la foto ya fue capurada
        buttonEvent.target.closest('ion-row').querySelector('.fotoLabel').style.display = 'block';

        //Limpiar el input type file en caso de que se haya seleccionado un archivo
        buttonEvent.target.closest('ion-row').querySelector('.fileChooser').value = '';
        
      }

    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al capturar la foto, intente nuevamente.',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
    }
  }

  selectFileDoc(fileChangeEvent, nombreControl) {
    const file = fileChangeEvent.target.files[0];
    //Asignar al control del archivo el resultado del input type file
    this.myForm.controls[nombreControl].patchValue(file ? file: '');

    //Ocultar la etiqueta que indica que la foto ya fue capurada debido a que se eleigio subir archivo
    fileChangeEvent.target.closest('ion-row').querySelector('.fotoLabel').style.display = 'none';
  }


  setUploadDocs(){
    const idUser = localStorage.getItem('id');
    this.userSvc.setFinishedDocs(idUser)
      .subscribe(
        async (res) => {
          if(res['res']){
            //this.loadingCtrl.dismiss();
            const alert = await this.alertCtrl.create({
              header: 'Aviso',
              message: res['msg'],
              buttons: [
                {
                  text : 'OK',
                  role : 'confirm'
                }
              ],
              backdropDismiss: false
            });
            await alert.present();
            const { role } = await alert.onWillDismiss();
            if(role === 'confirm') {
              this.router.navigate(['/chofer-tabs']);
            }
          }
        },
        async (error) => {
          //this.loadingCtrl.dismiss();
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  verificarVigencia(fecha){
    moment.locale('es-mx');
    //Si la fecha actual es mayor o igual a la fecha de vigencia registrada
    return moment().isSameOrAfter(moment(fecha));
  }

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner : 'circles'
    });
    return await loading.present();
  }
}
