import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { ToastController } from "@ionic/angular";
import { BehaviorSubject, Observable, throwError, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AuthService } from "../services/auth.service";
import { switchMap, finalize, filter, take } from "rxjs/operators"

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    //Usada para las cola de llamadas API mientras se refresca el token
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    isRefreshingToken = false;

    constructor(private authService: AuthService, private toastCtrl: ToastController) {}

    // Intercept every HTTP call
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.isInBlockedList(request.url)) {
            return next.handle(request);
        } else {
            return next.handle(this.addToken(request)).pipe(
                catchError(err => {
                    if (err instanceof HttpErrorResponse) {
                        switch (err.status) {
                            case 401:
                                return this.handle401Error(request, next);
                            default:
                                return throwError(err);
                        }
                    } else {
                        return throwError(err);
                    }
                })
            );
        }
    }

    //Filtrar las URL en donde no se desea añadir el token de acceso
    private isInBlockedList(url: string): Boolean {
        //Filtrar el endoint de login, registrarse y logout
        if(url == `${environment.api_url}/auth/login` ||
           url == `${environment.api_url}/auth/register`) {
            return true;
        } else {
            return false;
        }
    }

    //Añadir el actual token de acceso desde el servicio si esta presente
    private addToken(req: HttpRequest<any>){
        if(this.authService.currentAccessToken) {
            return req.clone({
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.authService.currentAccessToken}`
                })
            });
        } else {
            return req;
        }
    }

    //Si el token es invalido, tratar de cargar uno nuevo
    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        
        //Verificar si otra llamada esta usando la logica del refresco
        if(!this.isRefreshingToken) {
            //Poner en nulo para que otras llamadas puedan esperar
            //hasta que se tenga un nuevo token
            this.tokenSubject.next(null);
            this.isRefreshingToken = true;
            this.authService.currentAccessToken = null;

            //Primero, obtenermos el nuevo token de acceso
            return this.authService.getNewAccessToken().pipe(
                switchMap((tokens: any) => {
                    if(tokens) {
                        //Almacenar el nuevo token de acceso 
                        const acessToken = tokens['data'].accessToken;
                        //const refreshToken = tokens['data'].refreshToken;
                        return this.authService.storeNewTokens(acessToken).pipe(
                            switchMap(_ => {
                                //Usar el subject para que otras llamadas puedan continuar con el nuevo token
                                this.tokenSubject.next(acessToken);

                                //Ejecutar la peticional inicial nuevamente con el nuevo token
                                return next.handle(this.addToken(request));
                            })
                        )
                    } else {
                        //Ningun nuevo token se genero u otro problema
                        return of(null);
                    }
                }),
                finalize(() => {
                    // Unblock the token reload logic when everything is done
                    this.isRefreshingToken = false;
                })
            )
        } else {
             // "Queue" other calls while we load a new token
            return this.tokenSubject.pipe(
                    filter(token => token !== null),
                    take(1),
                    switchMap(token => {
                        // Perform the request again now that we got a new token!
                        return next.handle(this.addToken(request));
                })
            );
        }
    }
}