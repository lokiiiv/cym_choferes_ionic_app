import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { UserService } from "../services/user.service";
import { map, catchError } from 'rxjs/operators'

@Injectable({
    providedIn: 'root'
})

export class QuizGuard implements CanActivate{

    public isAnswerQuiz;
    constructor(
        private userSvc: UserService,
        private router: Router
    ){}

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        //Obtener la información del usuario para ver si ya contesto el quiz
        return this.userSvc.verificarRequerimientos(localStorage.getItem('id')).pipe(
            map((res) => {
                //Si el chofer no contestado el cuestionario, permitir abrir la pagina
                if(res['data'].contestarQuiz == 0){
                    return true;
                } else {
                    //Si ya lo contesto, redirigir a la pagina de inicio
                    this.router.navigate(['chofer-tabs'], { replaceUrl: true });
                    return false;
                }
            })
        )
    }

}