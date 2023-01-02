import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, UrlSegment, UrlTree} from '@angular/router';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { filter, take, map, tap, switchMap, timeout } from 'rxjs/operators'; 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authSvc: AuthService,
    private alertCtrl: AlertController
  ) {}

  canActivate(route: ActivatedRouteSnapshot){
    //Obtener el role requerido desde la ruta
    const expectedRoles = route.data?.roles || null;
    //console.log(expectedRoles);
    return this.authSvc.getUser().pipe(
      filter(val => val !== null),
      take(1),
      map(user => {
        //Si aun no hay un usuario autenticado o guardado
        if(!user) {
          this.showAlert('No has iniciado sesión aún para acceder a esta página.');
          return this.router.parseUrl('/');
        } else {
          const role = user['rol'];
          // console.log('Rol de usuario actual: ', role);
          // console.log(expectedRoles.indexOf(role));
          if(!expectedRoles || expectedRoles.indexOf(role) != -1) {
            return true;
          } else {
            this.router.parseUrl('/');
            //this.showAlert('No estas autorizado para acceder a esta página.');
            return this.router.parseUrl('/');
          }
        }
      })
    );  
  }


  async showAlert(mensaje: string) {
    let alert = await this.alertCtrl.create({
      header: 'No autorizado',
      message: mensaje,
      buttons: ['OK']
    });
    alert.present();
  }
}
