import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AlertController, ViewDidEnter, ViewDidLeave, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { UserService } from 'src/app/shared/services/user.service';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';
import { ToastController, LoadingController, ModalController } from '@ionic/angular';
import { InfomodalComponent } from '../infomodal/infomodal.component';

@Component({
  selector: 'app-main-tab',
  templateUrl: './main-tab.page.html',
  styleUrls: ['./main-tab.page.scss'],
})
export class MainTabPage implements OnInit, ViewWillEnter, AfterViewInit, ViewWillLeave{
  

  //Variables con datos basicos del administrador
  nombre: string;
  clave: string;
  rol: string;
  fotoUrl: string;

  public scanActive = false;

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

  public banForzar = false;

  public idChoferFromQr;
  public folioOrden = '';
  public empresa = '';
  public para = '';

  sliderConfig = {
    slidesPerView: 1.5,
  };

  constructor(
    private alertCtrl: AlertController,
    private userSvc: UserService,
    private router: Router,
    private plt: Platform,
    private asistenciaSvc: AsistenciaService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController) { 
      this.scanActive = false;
      
    }

  
  ionViewWillLeave(): void {
    this.stopScan();
  }


  ngAfterViewInit(): void {
    //BarcodeScanner.prepare();
  }
  

  ngOnInit() {
    
  }

  ionViewWillEnter(): void {
    
    this.getBasicChofer();
  }


  //Obtener la informacion basica del administrador
  async getBasicChofer(){
    await this.presentLoading('Cargando...');
    this.userSvc.getBasicAdmin(localStorage.getItem('id'), {rol: localStorage.getItem('rol')})
      .subscribe(
        async res => {
          let info = res['data'];
          this.nombre = info.nombreCompleto;
          this.clave = info.clave;
          this.rol = info.rol;
          this.fotoUrl = info.foto;

          this.loadingCtrl.dismiss();
        },
        async error => {
          this.loadingCtrl.dismiss();

          //Mostrar mensaje de error en Toast
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      );
  }


  async nuevaEntrada(para) {
    if(para == 'CEBADA') {

      const alert = await this.alertCtrl.create({
        header: 'Aviso',
        message: 'Para registrar una nueva entrada de descarga de cebada, es necesario escanear el código QR incluido la orden para obtener el folio, agricultor o empresa responsable.',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Cancelar'
          },
          {
            text: 'Aceptar',
            handler: () => {
              this.para = para;
              this.scanQRFromCebadaOrden();
            }
          }
        ]
      });
      await alert.present();

    } else {
      

      const alert = await this.alertCtrl.create({
        header: 'Aviso',
        message: 'Ha elegido registrar nueva asistencia para: ' + para + ', ¿Está seguro?',
        backdropDismiss: false,
        buttons: [
          {
            text: 'Cancelar'
          },
          {
            text: 'Aceptar',
            handler: async () => {
              this.para = para;
              
              //Pedir el folio de la orden que debe proporcionar el chofer
                const alert = await this.alertCtrl.create({
                  header: 'Por favor, ingresa el folio que viene en la orden que el chofer debe proporcionarle, así como la empresa transportista o agricultor del chofer.',
                  buttons: [{
                    text: 'Aceptar',
                    handler: async (alertData) => {
                      if(alertData.txtFolio != '' && alertData.txtEmpresa != '') {
                        let folio = alertData.txtFolio;
                        //Preguntar si el folio ingresado es el correcto para que lo verifique
                        const alert2 = await this.alertCtrl.create({
                          header: 'Aviso',
                          message: 'El folio ingresado es: ' + folio + '.\nPor favor verifique que sea el correcto.',
                          backdropDismiss: false,
                          buttons: [{
                              text: 'Intentar de nuevo',
                              handler: () => {
                                this.nuevaEntrada(para);
                              }
                            },
                            {
                              text : 'Es el correcto',
                              handler: async () => {
                                //Proceder a escaner el codigo QR para la entrada
                                this.folioOrden = alertData.txtFolio.trim();
                                this.empresa = alertData.txtEmpresa.trim();
                                
                                const alert3 = await this.alertCtrl.create({
                                  header: 'Aviso',
                                  message: 'Ahora es necesario que escaneé el código QR que le proporcionará el chofer para registrar su entrada a la planta.',
                                  backdropDismiss: false,
                                  buttons: [
                                    {
                                      text: 'Aceptar',
                                      handler: () => {
                                        //Llamar al metodo que ejecuta el escaneo
                                        this.openScanner();
                                      }
                                    }
                                  ]
                                });
                                await alert3.present();
                              }
                            }
                          ]
                        });
                        await alert2.present();
  
                      } else {
                        const toast = await this.toastCtrl.create({
                          message: '¡Por favor, ingrese el folio!',
                          duration: 2000,
                          position: 'bottom'
                        });
                        await toast.present();
                      }
                    }
                  }],
                  inputs: [
                    {
                      placeholder: 'Folio',
                      name : 'txtFolio'
                    },
                    {
                      placeholder: 'Empresa transportista',
                      name: 'txtEmpresa'
                    }
                  ],
                });
                await alert.present();
            }
          }
        ]
      });
      await alert.present();
    }
  }


  async scanQRFromCebadaOrden(){
    if(this.plt.is('cordova')) {
      //Comenzar con el escaneo del qr incluido en la orden de descarga de cebada

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
          //Obtener el valor del codigo qr incluido en la orden de cebada
          //Usar expresiones regulares para obtener los valores del folio y productor o empresa
          let folioRegex = /Folio:\w.*/g.exec(result.content);
          let empresaRegex = /Productor:\w.*/g.exec(result.content);

          //Verificar si al ejecutar el regex no devulve valores nulos
          if(folioRegex == null || empresaRegex == null) {
            const toast = await this.toastCtrl.create({
              message: 'Error al obtener la información del QR, verifique que sea el código correcto.',
              duration: 2000,
              position: 'bottom'
            });
            await toast.present();

          } else if(folioRegex!= null && empresaRegex != null) {

            //Dividir el registado del regex debido a que solo se quiere obtener el valor despues de los dos puntos
            //Ejemplo:  Folio:Altiplano87237263 => Altiplano87237263
            this.folioOrden = folioRegex.toString().split(':')[1];
            this.empresa = empresaRegex.toString().split(':')[1];

            let alert = await this.alertCtrl.create({
              header: 'Aviso',
              message: 'Se detectó el folio: ' + this.folioOrden + ', cuyo productor o empresa es: ' + this.empresa + '. Ahora es necesario que escane el código QR del chófer para registrar la entrada.',
              backdropDismiss: false,
              buttons: [
                {
                  text: 'Cancelar'
                },
                {
                  text: 'Aceptar',
                  handler: async () => {
                    //Si se acepta, proceder a escanear ahora el codigo QR del chofer para registrar la entrada
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
                        //Enviar el valor del codigo QR para realizar la entrada o salida según sea el caso
                        this.idChoferFromQr = result.content;
                        this.registrarEntrada(this.idChoferFromQr, this.folioOrden, this.para, this.empresa);
                      }
                    }
                  }
                }
              ]
            });
            await alert.present(); 
          }   
        }
      }
    } else {
      let alert = await this.alertCtrl.create({
        header: 'Aviso',
        message: 'El escaneo de codigo no funciona estando en el navegador web.',
        buttons: ['OK']
      });
      alert.present();
    }
  }




  public async openScanner(){
    if(this.plt.is('cordova')){
      //this.router.navigate(['/admin-tabs/scanner']);
      this.startScaner();
    } else {
      let alert = await this.alertCtrl.create({
        header: 'Aviso',
        message: 'El escaneo de codigo no funciona estando en el navegador web.',
        buttons: ['OK']
      });
      alert.present();
    }
  }

  public openListChoferes() {
    this.router.navigate(['/admin-tabs/main/choferes-lista']);
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
        //Enviar el valor del codigo QR para realizar la entrada o salida según sea el caso
        this.idChoferFromQr = result.content;
        this.registrarEntrada(this.idChoferFromQr, this.folioOrden, this.para, this.empresa);
      }
    }
  }

  //Funcion para verificar si se tiene permiso de acceder a la camara
  async checkPermission() {
    return new Promise(async (resolve, reject) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {

        const alert = await this.alertCtrl.create({
          header: "Sin permiso",
          message: "Por favor, permite el acceso a la cámara en tus ajustes.",
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

  stopScan(){
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    this.scanActive = false;
    this.showTabs();
    document.querySelector('body').classList.remove('scanner-active');
  }

  async registrarEntrada(qrValue, folio, para, empresa) {
    //Registrar un nuevo flujo o ruta de cebada y registrar si entrada
    let dataBody;
    dataBody = {
      folio: folio,
      att_for: para,
      empresa : empresa,
      FK_idUser: qrValue,
      user_who_register: localStorage.getItem('id'),
      forzar: this.banForzar
    };

    await this.presentLoading('Registrando...');
    this.asistenciaSvc.registrarEntrada(dataBody)
      .subscribe(
        (res) => {
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
          //Abrir el modal para mostrar informacion
          this.openInfoModal();
        },
        async (error) => {    
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
    if(role === 'confirmPermitir' || role == 'confirmOlvido') {
      this.banForzar = true;

      //Volver a registrar la entrada
      this.registrarEntrada(this.idChoferFromQr, this.folioOrden, this.para, this.empresa);
      this.banForzar = false;
    }
  }


  openRutas() {
    this.router.navigate(['/admin-tabs/main/rutas-activas']);
  }

  openModificarDocs() {
    this.router.navigate(['/admin-tabs/main/definir-documentos']);
  }

  openAgregarUsuario() {
    this.router.navigate(['/admin-tabs/main/crear-usuarios']);
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
