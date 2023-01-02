import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Observable, Subject, timer } from 'rxjs';
import { Attendance, LastAttendance } from 'src/app/shared/interfaces/attendance.interface';
import { Router } from '@angular/router';
import { switchMap, tap, share, retry, takeUntil } from 'rxjs/operators';
import { AsistenciaService } from 'src/app/shared/services/asistencia.service';

@Component({
  selector: 'app-modalqr',
  templateUrl: './modalqr.component.html',
  styleUrls: ['./modalqr.component.scss'],
})
export class ModalqrComponent implements OnInit, OnDestroy {

  
  public qrValue;


  // private lastAttendance$: Observable<LastAttendance>;
  // private stopPolling = new Subject();

  // private lastDateAtt: Date;

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private asistenciaSvc: AsistenciaService
    ) 
    { 

    }

  ngOnInit() {
    // //Obtener primero la fecha la ultima asistencia disponible
    // this.asistenciaSvc.getLastAttendance(localStorage.getItem('id'))
    //   .subscribe(
    //     (resp) => {
    //       const last_att = resp['data'];
    //       //console.log(last_att);
    //       if(last_att != null){
    //         this.lastDateAtt = last_att.date_created;
    //         this.getLastAttendance();
    //       } else {
    //         //En caso de que no tenga asistencia registradas
    //         this.getLastAttendance();
    //       }
    //     },
    //     (error) => {
    //       this.cancel();
    //     }
    //   )
    
  }

  ngOnDestroy(): void {
    //this.stopPolling.next();
  }

  //Ejecutar una peticion para obtener la ultima asistencia disponible de forma continua
  // getLastAttendance(){
  //   timer(1, 1000).pipe(
  //     switchMap(() => this.asistenciaSvc.getLastAttendance(localStorage.getItem('id'))),
  //     retry(),
  //     share(),
  //     takeUntil(this.stopPolling)
  //   ).subscribe(
  //     (res) => {
  //       const last_att = res['data'];
  //       if(last_att != null) {
  //         if(this.lastDateAtt != last_att.date_created){
  //           //Si la fecha es diferente al valor inicial, quiere decir que se agrego una nueva asistencia
  //           //Por lo tanto se debe cerrar el modal con el QR.
  //           this.cancel();
  //         }
  //       }
        
  //     },
  //     (error) => {
  //       this.cancel();
  //     }
  //   );
  // }
    
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }
}
