import { Component, OnInit } from '@angular/core';
import { ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';
import { AlertController, ToastController, LoadingController, ModalController } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Platform } from '@ionic/angular';
import { Route, Router } from '@angular/router';
import { InfomodalComponent } from '../infomodal/infomodal.component';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-todo-rutas',
  templateUrl: './todo-rutas.page.html',
  styleUrls: ['./todo-rutas.page.scss'],
})
export class TodoRutasPage implements OnInit, ViewWillEnter, ViewWillLeave {

  public listaRutas;
  public searchedRutas;


  public scanActive = false;
  public eleccion;
  public idRuta;
  public para;

  public idChoferFromQR;


  fotoUrl: string;

  //Propeidades del chofer a registrar asistencia
  public foto: string;
  public nombreCompleto: string;
  public message: string;
  public empresaTransportista: string;
  public edad: string;
  public estadoProcedencia: string;
  public status: string;
  public idAsistencia;
  public success: boolean;
  public permitir: boolean;
  public olvido: boolean;

  constructor(private asistenciaSvc: AsistenciaService,
    private alertController: AlertController,
    private toastCtrl: ToastController,
    private plt: Platform,
    private router: Router,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private authService: AuthService) { 
      this.scanActive = false;
    }

  ionViewWillEnter(): void {
    this.actualizarRutas(null);
  }

  ionViewWillLeave(): void {
    this.stopScan();
  }

  ngOnInit() {
  }

  searchRuta(event) {
    const text = event.target.value;
    this.searchedRutas = this.listaRutas;
    if(text && text.trim() != '') {
      this.searchedRutas = this.searchedRutas.filter((ruta) => {
        return (ruta.nombre.toLowerCase().indexOf(text.toLowerCase()) > -1
          || ruta.folio.toLowerCase().indexOf(text.toLowerCase()) > -1)
      });
    }
  }
  //Actualizar los datos cuando se usa el ion-refresher
  async actualizarRutas(event){
    if (event == null) {
      await this.presentLoading('Buscando...');
    }
    
    return this.asistenciaSvc.getRutas()
      .subscribe(
        res => {
          this.listaRutas = res['data'];
          this.searchedRutas = this.listaRutas;
          
          if(event)
            event.target.complete();
          
          this.loadingCtrl.dismiss();
        },
        error => {
          if(event)
            event.target.complete();

          this.loadingCtrl.dismiss();
        }
      )
      
  }

  async registrarAsistencia(idRuta, tipo, nombre, folio) {
    //Guardar si la asistencia es para cebada, malta o producto
    const alert = await this.alertController.create({
      header: 'Aviso',
      message: 'Esta a punto de registrar un movimiento para el flujo de ' + tipo + ' cuyo chofer es ' + nombre + ' con folio: ' + folio + '. ¿Está seguro?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Aceptar',
          handler: async () => {
            this.para = tipo;
            if(this.para == 'CEBADA') {

              //Verificar el rol del usuario registrado, si es vigilancia, solo mostrar el movimiento de salida
              if(localStorage.getItem('rol') === 'vigilancia') {

                const alert = await this.alertController.create({
                  header: 'Selecciona el movimiento a registrar.',
                  buttons: [{
                    text: 'Aceptar',
                    handler : async (data) => {
                      this.eleccion = data;
                      this.idRuta = idRuta;
                      if(data != undefined) {
  
                        //Comenzar con el escaneo del codigoQR del chofer
                        this.openScanner();
  
                      } else {
                        const toast = await this.toastCtrl.create({
                          message: '¡Por favor, seleccione un valor!',
                          duration: 2000,
                          position: 'bottom'
                        });
                        await toast.present();
                      } 
                    }
                  }],
                  mode : 'ios',
                  inputs: [
                    {
                      label: 'SALIDA DE PLANTA',
                      type: 'radio',
                      value: 'SALIDA',
                    },
                  ],
                });
                await alert.present();
              } else {
                const alert = await this.alertController.create({
                  header: 'Selecciona el movimiento a registrar.',
                  buttons: [{
                    text: 'Aceptar',
                    handler : async (data) => {
                      this.eleccion = data;
                      this.idRuta = idRuta;
                      if(data != undefined) {
  
                        //Comenzar con el escaneo del codigoQR del chofer
                        this.openScanner();
  
                      } else {
                        const toast = await this.toastCtrl.create({
                          message: '¡Por favor, seleccione un valor!',
                          duration: 2000,
                          position: 'bottom'
                        });
                        await toast.present();
                      } 
                    }
                  }],
                  mode : 'ios',
                  inputs: [
                    {
                      label: 'ENTRADA A BÁSCULA',
                      type: 'radio',
                      value: 'ENTRADA_BASCULA',
                    },
                    {
                      label: 'SALIDA DE BÁSCULA',
                      type: 'radio',
                      value: 'SALIDA_BASCULA',
                    },
                    {
                      label: 'INICIO DE DESENLONE',
                      type: 'radio',
                      value: 'INICIO_DESENLONE',
                    },
                    {
                      label: 'SALIDA DE DESENLONE',
                      type: 'radio',
                      value: 'SALIDA_DESENLONE',
                    },
                    {
                      label: 'INICIO DE MUESTREO',
                      type: 'radio',
                      value: 'INICIO_MUESTREO',
                    },
                    {
                      label: 'SALIDA DE MUESTREO',
                      type: 'radio',
                      value: 'SALIDA_MUESTREO',
                    },
                    {
                      label: 'INICIO DE DESCARGA',
                      type: 'radio',
                      value: 'INICIO_DESCARGA',
                    },
                    {
                      label: 'SALIDA DE DESCARGA',
                      type: 'radio',
                      value: 'SALIDA_DESCARGA',
                    },
                    {
                      label: 'SEGUNDA ENTRADA A BÁSCULA',
                      type: 'radio',
                      value: 'ENTRADA_BASCULA_2',
                    },
                    {
                      label: 'SEGUNDA SALIDA DE BÁSCULA',
                      type: 'radio',
                      value: 'SALIDA_BASCULA_2',
                    },
                    {
                      label: 'SALIDA DE PLANTA',
                      type: 'radio',
                      value: 'SALIDA',
                    },
                  ],
                });
            
                await alert.present();
              }
              
            } else if (this.para == 'MALTA') {

              if(localStorage.getItem('rol') === 'vigilancia') {
                const alert = await this.alertController.create({
                  header: 'Selecciona el movimiento a registrar.',
                  buttons: [{
                    text: 'Aceptar',
                    handler : async (data) => {
                      this.eleccion = data;
                      this.idRuta = idRuta;
                      if(data != undefined) {
  
                        //Comenzar con el escaneo del codigoQR del chofer
                        this.openScanner();
  
                      } else {
                        const toast = await this.toastCtrl.create({
                          message: '¡Por favor, seleccione un valor!',
                          duration: 2000,
                          position: 'bottom'
                        });
                        await toast.present();
                      } 
                    }
                  }],
                  mode : 'ios',
                  inputs: [
                    {
                      label: 'SALIDA DE PLANTA',
                      type: 'radio',
                      value: 'SALIDA',
                    },
                  ],
                });
                await alert.present();

              } else {
                const alert = await this.alertController.create({
                  header: 'Selecciona el movimiento a registrar.',
                  buttons: [{
                    text: 'Aceptar',
                    handler : async (data) => {
                      this.eleccion = data;
                      this.idRuta = idRuta;
                      if(data != undefined) {
  
                        //Comenzar con el escaneo del codigoQR del chofer
                        this.openScanner();
  
                      } else {
                        const toast = await this.toastCtrl.create({
                          message: '¡Por favor, seleccione un valor!',
                          duration: 2000,
                          position: 'bottom'
                        });
                        await toast.present();
                      } 
                    }
                  }],
                  mode : 'ios',
                  inputs: [
                    {
                      label: 'ENTRADA A BÁSCULA',
                      type: 'radio',
                      value: 'ENTRADA_BASCULA'
                    },
                    {
                      label: 'SALIDA DE BÁSCULA',
                      type: 'radio',
                      value: 'SALIDA_BASCULA'
                    },
                    {
                      label: 'INICIO DE CARGA DE MALTA',
                      type: 'radio',
                      value: 'INICIO_CARGA'
                    },
                    {
                      label: 'SALIDA DE CARGA DE MALTA',
                      type: 'radio',
                      value: 'SALIDA_CARGA'
                    },
                    {
                      label: 'SEGUNDA ENTRADA A BÁSCULA',
                      type: 'radio',
                      value: 'ENTRADA_BASCULA_2',
                    },
                    {
                      label: 'SEGUNDA SALIDA DE BÁSCULA',
                      type: 'radio',
                      value: 'SALIDA_BASCULA_2',
                    },
                    {
                      label: 'SALIDA DE PLANTA',
                      type: 'radio',
                      value: 'SALIDA',
                    },
                  ],
                });
            
                await alert.present();
              }

              
            } else if (this.para == 'COPRODUCTO') {

              if(localStorage.getItem('rol') === 'vigilancia') {
                const alert = await this.alertController.create({
                  header: 'Selecciona el movimiento a registrar.',
                  buttons: [{
                    text: 'Aceptar',
                    handler : async (data) => {
                      this.eleccion = data;
                      this.idRuta = idRuta;
                      if(data != undefined) {
  
                        //Comenzar con el escaneo del codigoQR del chofer
                        this.openScanner();
  
                      } else {
                        const toast = await this.toastCtrl.create({
                          message: '¡Por favor, seleccione un valor!',
                          duration: 2000,
                          position: 'bottom'
                        });
                        await toast.present();
                      } 
                    }
                  }],
                  mode : 'ios',
                  inputs: [
                    {
                      label: 'SALIDA DE PLANTA',
                      type: 'radio',
                      value: 'SALIDA',
                    },
                  ],
                });
            
                await alert.present();
              } else {

                const alert = await this.alertController.create({
                  header: 'Selecciona el movimiento a registrar.',
                  buttons: [{
                    text: 'Aceptar',
                    handler : async (data) => {
                      this.eleccion = data;
                      this.idRuta = idRuta;
                      if(data != undefined) {
  
                        //Comenzar con el escaneo del codigoQR del chofer
                        this.openScanner();
  
                      } else {
                        const toast = await this.toastCtrl.create({
                          message: '¡Por favor, seleccione un valor!',
                          duration: 2000,
                          position: 'bottom'
                        });
                        await toast.present();
                      } 
                    }
                  }],
                  mode : 'ios',
                  inputs: [
                    {
                      label: 'ENTRADA A BÁSCULA',
                      type: 'radio',
                      value: 'ENTRADA_BASCULA'
                    },
                    {
                      label: 'SALIDA DE BÁSCULA',
                      type: 'radio',
                      value: 'SALIDA_BASCULA'
                    },
                    {
                      label: 'INICIO DE CARGA DE COPRODUCTO',
                      type: 'radio',
                      value: 'INICIO_CARGA'
                    },
                    {
                      label: 'SALIDA DE CARGA DE COPRODUCTO',
                      type: 'radio',
                      value: 'SALIDA_CARGA'
                    },
                    {
                      label: 'SEGUNDA ENTRADA A BÁSCULA',
                      type: 'radio',
                      value: 'ENTRADA_BASCULA_2',
                    },
                    {
                      label: 'SEGUNDA SALIDA DE BÁSCULA',
                      type: 'radio',
                      value: 'SALIDA_BASCULA_2',
                    },
                    {
                      label: 'SALIDA DE PLANTA',
                      type: 'radio',
                      value: 'SALIDA',
                    },
                  ],
                });
            
                await alert.present();

              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  public async openScanner(){
    if(this.plt.is('cordova')){
      //this.router.navigate(['/admin-tabs/scanner']);
      this.startScaner();
    } else {
      let alert = await this.alertController.create({
        header: 'Aviso',
        message: 'El escaneo de codigo no funciona estando en el navegador web.',
        buttons: ['OK']
      });
      alert.present();
    }
  }

  async startScaner (){
    //comenzar con el escaneo
    const allowed = await this.checkPermission();
    if(allowed) {
      await BarcodeScanner.hideBackground();
      this.scanActive = true;
      this.hideTabs();
      document.querySelector('body').classList.add('scanner-active');
      const result = await BarcodeScanner.startScan();
      BarcodeScanner.showBackground();
      this.scanActive = false;
      this.showTabs();
      document.querySelector('body').classList.remove('scanner-active');
      if(result.hasContent) {

        this.idChoferFromQR = result.content;
        //Enviar el valor del codigo QR para registrar la asistencia
        if(this.para == 'CEBADA') {
          this.registrarMovimientoCebada();
        } else if(this.para == 'MALTA') {
          this.registrarMovimientoMalta();
        } else if(this.para == 'COPRODUCTO') {
          this.registrarMovimientoCoproducto();
        }
       
      }
    }
  }

  stopScan(){
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    this.scanActive = false;
    this.showTabs();
    document.querySelector('body').classList.remove('scanner-active');
  }

  //Funcion para verificar si se tiene permiso de acceder a la camara
  async checkPermission() {
    return new Promise(async (resolve, reject) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {

        const alert = await this.alertController.create({
          header: "Sin permiso",
          message: "Por favor, permito el acceso a la cámara en tus ajustes.",
          buttons : [{
            text: "No",
            role: "Cancel",
            handler: () => {
              this.router.navigate(['/admin-tabs/main'], { replaceUrl: true });
            }
          },{
            text: "Abrir configuración",
            handler: () => {
              BarcodeScanner.openAppSettings();
              resolve(false);
            }
          }]
        });
        await alert.present();
      } else {
        resolve(false); 
      }
    });
  }

  async registrarMovimientoCebada() {
    let dataBody;
    dataBody = {
      idChofer : this.idChoferFromQR,
      user_who_register : localStorage.getItem('id'),
      movimiento : this.eleccion
    };
    await this.presentLoading('Registrando...');

    this.asistenciaSvc.registrarMovimientoCebada(dataBody, this.idRuta)
      .subscribe(
        async res => {
          let data = res['data'];
          this.fotoUrl =  data.foto;
          this.nombreCompleto = data.nombreCompleto;
          this.message = res['msg'];
          this.empresaTransportista = data.empresaTransportista;
          this.edad = data.edad;
          this.estadoProcedencia = data.estadoProcedencia;
          this.status = data.estatus
          this.success = res['success'];
          this.permitir = res['permitir'];
          this.olvido = res['olvido'];

          this.loadingCtrl.dismiss();
          //Mostrar modal con la informacion resultante de la asistencia
          this.openInfoModal();
        },
        async error => {
          this.loadingCtrl.dismiss();
          
          this.router.navigate(['/admin-tabs'], { replaceUrl: true })
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  async registrarMovimientoCebadaIncompleto() {
    let dataBody;
    dataBody = {
      idChofer : this.idChoferFromQR,
      user_who_register : localStorage.getItem('id'),
      movimiento : this.eleccion
    };
    await this.presentLoading('Registrando...');

    this.asistenciaSvc.registrarMovimientoCebadaIncompleto(dataBody, this.idRuta)
      .subscribe(
        async res => {
          let data = res['data'];
          this.fotoUrl =  data.foto;
          this.nombreCompleto = data.nombreCompleto;
          this.message = res['msg'];
          this.empresaTransportista = data.empresaTransportista;
          this.edad = data.edad;
          this.estadoProcedencia = data.estadoProcedencia;
          this.status = data.estatus
          this.success = res['success'];
          this.permitir = res['permitir'];
          this.olvido = res['olvido'];

          this.loadingCtrl.dismiss();
          //Mostrar modal con la informacion resultante de la asistencia
          this.openInfoModal();
        },
        async error => {
          this.loadingCtrl.dismiss();
          
          this.router.navigate(['/admin-tabs'], { replaceUrl: true })
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  async registrarMovimientoCebadaForzar() {
    let dataBody;
    dataBody = {
      idChofer : this.idChoferFromQR,
      user_who_register : localStorage.getItem('id'),
      movimiento : this.eleccion
    };
    await this.presentLoading('Registrando...');

    this.asistenciaSvc.registrarMovimientoCebadaForzar(dataBody, this.idRuta)
      .subscribe(
        async res => {
          let data = res['data'];
          this.fotoUrl =  data.foto;
          this.nombreCompleto = data.nombreCompleto;
          this.message = res['msg'];
          this.empresaTransportista = data.empresaTransportista;
          this.edad = data.edad;
          this.estadoProcedencia = data.estadoProcedencia;
          this.status = data.estatus
          this.success = res['success'];
          this.permitir = res['permitir'];
          this.olvido = res['olvido'];

          this.loadingCtrl.dismiss();
          //Mostrar modal con la informacion resultante de la asistencia
          this.openInfoModal();
        },
        async error => {
          this.loadingCtrl.dismiss();
          
          this.router.navigate(['/admin-tabs'], { replaceUrl: true })
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }



  //Metodos para agregar o registrar movimientos de malta
  async registrarMovimientoMalta() {
    let dataBody;
    dataBody = {
      idChofer : this.idChoferFromQR,
      user_who_register : localStorage.getItem('id'),
      movimiento : this.eleccion
    };
    await this.presentLoading('Registrando...');

    this.asistenciaSvc.registrarMovimientoMalta(dataBody, this.idRuta)
      .subscribe(
        async res => {
          let data = res['data'];
          this.fotoUrl =  data.foto;
          this.nombreCompleto = data.nombreCompleto;
          this.message = res['msg'];
          this.empresaTransportista = data.empresaTransportista;
          this.edad = data.edad;
          this.estadoProcedencia = data.estadoProcedencia;
          this.status = data.estatus
          this.success = res['success'];
          this.permitir = res['permitir'];
          this.olvido = res['olvido'];

          this.loadingCtrl.dismiss();
          //Mostrar modal con la informacion resultante de la asistencia
          this.openInfoModal();
        },
        async error => {
          this.loadingCtrl.dismiss();
          
          this.router.navigate(['/admin-tabs'], { replaceUrl: true })
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  async registrarMovimientoMaltaIncompleto() {
    let dataBody;
    dataBody = {
      idChofer : this.idChoferFromQR,
      user_who_register : localStorage.getItem('id'),
      movimiento : this.eleccion
    };
    await this.presentLoading('Registrando...');

    this.asistenciaSvc.registrarMovimientoMaltaIncompleto(dataBody, this.idRuta)
      .subscribe(
        async res => {
          let data = res['data'];
          this.fotoUrl =  data.foto;
          this.nombreCompleto = data.nombreCompleto;
          this.message = res['msg'];
          this.empresaTransportista = data.empresaTransportista;
          this.edad = data.edad;
          this.estadoProcedencia = data.estadoProcedencia;
          this.status = data.estatus
          this.success = res['success'];
          this.permitir = res['permitir'];
          this.olvido = res['olvido'];

          this.loadingCtrl.dismiss();
          //Mostrar modal con la informacion resultante de la asistencia
          this.openInfoModal();
        },
        async error => {
          this.loadingCtrl.dismiss();
          
          this.router.navigate(['/admin-tabs'], { replaceUrl: true })
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  async registrarMovimientoMaltaForzar() {
    let dataBody;
    dataBody = {
      idChofer : this.idChoferFromQR,
      user_who_register : localStorage.getItem('id'),
      movimiento : this.eleccion
    };
    await this.presentLoading('Registrando...');

    this.asistenciaSvc.registrarMovimientoMaltaForzar(dataBody, this.idRuta)
      .subscribe(
        async res => {
          let data = res['data'];
          this.fotoUrl =  data.foto;
          this.nombreCompleto = data.nombreCompleto;
          this.message = res['msg'];
          this.empresaTransportista = data.empresaTransportista;
          this.edad = data.edad;
          this.estadoProcedencia = data.estadoProcedencia;
          this.status = data.estatus
          this.success = res['success'];
          this.permitir = res['permitir'];
          this.olvido = res['olvido'];

          this.loadingCtrl.dismiss();
          //Mostrar modal con la informacion resultante de la asistencia
          this.openInfoModal();
        },
        async error => {
          this.loadingCtrl.dismiss();
          
          this.router.navigate(['/admin-tabs'], { replaceUrl: true })
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }


  //Metodos para agregar o registrar movimientos de coproducto
  async registrarMovimientoCoproducto() {
    let dataBody;
    dataBody = {
      idChofer : this.idChoferFromQR,
      user_who_register : localStorage.getItem('id'),
      movimiento : this.eleccion
    };
    await this.presentLoading('Registrando...');

    this.asistenciaSvc.registrarMovimientoCoproducto(dataBody, this.idRuta)
      .subscribe(
        async res => {
          let data = res['data'];
          this.fotoUrl =  data.foto;
          this.nombreCompleto = data.nombreCompleto;
          this.message = res['msg'];
          this.empresaTransportista = data.empresaTransportista;
          this.edad = data.edad;
          this.estadoProcedencia = data.estadoProcedencia;
          this.status = data.estatus
          this.success = res['success'];
          this.permitir = res['permitir'];
          this.olvido = res['olvido'];

          this.loadingCtrl.dismiss();
          //Mostrar modal con la informacion resultante de la asistencia
          this.openInfoModal();
        },
        async error => {
          this.loadingCtrl.dismiss();
          
          this.router.navigate(['/admin-tabs'], { replaceUrl: true })
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  async registrarMovimientoCoproductoIncompleto() {
    let dataBody;
    dataBody = {
      idChofer : this.idChoferFromQR,
      user_who_register : localStorage.getItem('id'),
      movimiento : this.eleccion
    };
    await this.presentLoading('Registrando...');

    this.asistenciaSvc.registrarMovimientoCoproductoIncompleto(dataBody, this.idRuta)
      .subscribe(
        async res => {
          let data = res['data'];
          this.fotoUrl =  data.foto;
          this.nombreCompleto = data.nombreCompleto;
          this.message = res['msg'];
          this.empresaTransportista = data.empresaTransportista;
          this.edad = data.edad;
          this.estadoProcedencia = data.estadoProcedencia;
          this.status = data.estatus
          this.success = res['success'];
          this.permitir = res['permitir'];
          this.olvido = res['olvido'];

          this.loadingCtrl.dismiss();
          //Mostrar modal con la informacion resultante de la asistencia
          this.openInfoModal();
        },
        async error => {
          this.loadingCtrl.dismiss();
          
          this.router.navigate(['/admin-tabs'], { replaceUrl: true })
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  async registrarMovimientoCoproductoForzar() {
    let dataBody;
    dataBody = {
      idChofer : this.idChoferFromQR,
      user_who_register : localStorage.getItem('id'),
      movimiento : this.eleccion
    };
    await this.presentLoading('Registrando...');

    this.asistenciaSvc.registrarMovimientoCoproductoForzar(dataBody, this.idRuta)
      .subscribe(
        async res => {
          let data = res['data'];
          this.fotoUrl =  data.foto;
          this.nombreCompleto = data.nombreCompleto;
          this.message = res['msg'];
          this.empresaTransportista = data.empresaTransportista;
          this.edad = data.edad;
          this.estadoProcedencia = data.estadoProcedencia;
          this.status = data.estatus
          this.success = res['success'];
          this.permitir = res['permitir'];
          this.olvido = res['olvido'];

          this.loadingCtrl.dismiss();
          //Mostrar modal con la informacion resultante de la asistencia
          this.openInfoModal();
        },
        async error => {
          this.loadingCtrl.dismiss();
          
          this.router.navigate(['/admin-tabs'], { replaceUrl: true })
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }


  //Abrir modal para mostrar la información acerca del registro de entrada o salida luedo del scaneo
  async openInfoModal(){
    const modal = await this.modalCtrl.create({
      component: InfomodalComponent,
      backdropDismiss: false,
      componentProps : {
        fotoUrl: this.fotoUrl,
        nombreCompleto: this.nombreCompleto,
        message: this.message,
        empresaTransportista: this.empresaTransportista,
        edad: this.edad,
        estadoProcedencia: this.estadoProcedencia,
        status: this.status,
        success: this.success,
        permitir: this.permitir,
        olvido: this.olvido
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirmPermitir') {
      //Registrar el movimiento si el estatus del chofer es incompleto
      //Enviar el valor del codigo QR para registrar la asistencia
      if(this.para == 'CEBADA') {
        this.registrarMovimientoCebadaIncompleto();   
      } else if(this.para == 'MALTA') {
        this.registrarMovimientoMaltaIncompleto();
      } else if(this.para == 'COPRODUCTO') {
        this.registrarMovimientoCoproductoIncompleto();
      }

    } else if (role === 'confirmOlvido') {

      if(this.para == 'CEBADA') {
        this.registrarMovimientoCebadaForzar();
      } else if(this.para == 'MALTA') {
        this.registrarMovimientoMaltaForzar();
      } else if (this.para == 'COPRODUCTO') {
        this.registrarMovimientoCoproductoForzar();
      }
    }
  }

  async presentLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner : 'circles'
    });
    return await loading.present();
  }

   //Metodo para ocultar las pestañas mientras el escaneo esta activo
   hideTabs(){
    const tabs = document.querySelectorAll('ion-tab-bar');
      Object.keys(tabs).map((key) => {
        tabs[key].style.display = 'none';
    });
  }

  //Metodo para mostrar las pestañas cuendo ele scaneo finalizo
  showTabs() {
    const tabs = document.querySelectorAll('ion-tab-bar');
      Object.keys(tabs).map((key) => {
        tabs[key].style.display = 'flex';
    });
  }
}
