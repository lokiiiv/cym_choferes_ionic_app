import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad} from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginGuard implements CanActivate {

  constructor(private router: Router, private authSvc: AuthService){

  }

  canActivate(route: ActivatedRouteSnapshot) {
    return this.authSvc.getUser().pipe(
      filter(val => val !== null),
      take(1),
      map(user => {
        if(!user) {
          //Si no hay usuario logueado, permitir mostrar la vista de login
          return true;
        } else {
          //Si el usuario ya esta logueado, redirigir a su pagina de inicio para no mostrar de nuevo el login
          const role = user['rol'];
          if(role === 'chofer'){
            this.router.navigate(['chofer-tabs'], { replaceUrl: true });
            return false;
          } else if(role === 'admin' || role === 'seguridad' || role === 'vigilancia' || role === 'logistica') {
            this.router.navigate(['admin-tabs'], { replaceUrl: true });
            return false;
          }
        }
      })
    )
  }
}
