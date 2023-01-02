import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-infomodal',
  templateUrl: './infomodal.component.html',
  styleUrls: ['./infomodal.component.scss'],
})
export class InfomodalComponent implements OnInit {

  //Propeidades del chofer a registrar entrada
  public fotoUrl: string;
  public nombreCompleto: string;
  public message: string;
  public empresaTransportista: string;
  public edad: string;
  public estadoProcedencia: string;
  public status: string;
  public idAsistencia;
  public success: string;
  public permitir: boolean;
  public olvido: boolean;

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private alertController: AlertController) { }

  ngOnInit() {}

  cancel() {
    //this.router.navigate(['/admin-tabs/main/rutas-activas'], { replaceUrl: true});
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async confirmPermitir(){
    const alert = await this.alertController.create({
      header: 'Advertencia',
      message: 'Es posible que el chófer aún no registre su documentación completa o haya visto el video de inducción de seguridad. ¿Aún así desea registrar su movimiento?',
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Aceptar',
          handler : () => {
            return this.modalCtrl.dismiss(null, 'confirmPermitir');
          }
        }],
    });
    await alert.present();
  }

  async confirmOlvidar() {
    const alert = await this.alertController.create({
      header: 'Advertencia',
      message: 'Es posible que se haya olvidado registrar un movimiento anterior. ¿Desea registrar este movimiento de todos modos?',
      buttons: [
        {
          text: 'Cancelar'
        },
        {
          text: 'Aceptar',
          handler : () => {
            return this.modalCtrl.dismiss(null, 'confirmOlvido');
          }
        }],
    });
    await alert.present();
  }
}
