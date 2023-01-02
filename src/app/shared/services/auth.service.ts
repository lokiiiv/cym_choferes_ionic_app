import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { tap, map, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';
import { UserInfo } from '../interfaces/user-info.interface';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

const TOKEN_KEY = 'user-token';

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    private apiURL = environment.api_url;

    private currentUser: BehaviorSubject<any> = new BehaviorSubject(null);
    currentAccessToken = null;

    private httpHeader = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    constructor(
        private http: HttpClient,
        private router: Router,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController
    ) {
        this.loadUser();
    }

    public login(body) {
        return this.http.post(this.apiURL + '/auth/login', body, this.httpHeader).pipe(
            tap(res => {
                console.log(res);
                //Almacenar el user o el token
                this.currentAccessToken = res['data']['accessToken'];
                Preferences.set({ key: TOKEN_KEY, value: JSON.stringify(res['data']) });
                this.currentUser.next(res['data']);
            })
        );
    }

    public register(body) {
        return this.http.post(this.apiURL + '/auth/register', body, this.httpHeader).pipe(
            tap(res => {
                //Almacenar el user o el token
                this.currentAccessToken = res['data']['accessToken'];
                Preferences.set({ key: TOKEN_KEY, value: JSON.stringify(res['data']) });
                this.currentUser.next(res['data']);
            })
        );
    }


    loadUser() {
        //Normalmente se carga por ejemplo un JWT en este punto
        Preferences.get({ key: TOKEN_KEY }).then(res => {
            if (res.value) {
                this.currentAccessToken = JSON.parse(res.value)['accessToken']
                this.currentUser.next(JSON.parse(res.value));
            } else {
                this.currentUser.next(false);
            }
        });
    }

    //Acceder al usuario actual
    getUser() {
        return this.currentUser.asObservable();
    }

    //Remover toda la información del usuario previo para poder cerrar sesion
    async logout() {

        const alert = await this.alertCtrl.create({
            header: 'Aviso',
            message: '¿Esta seguro de cerrar sesión?',
            buttons: [
                {
                    text: 'Cancelar'
                },
                {
                    text: 'Aceptar',
                    handler: () => {
                        Preferences.get({ key: TOKEN_KEY }).then(async res => {
                            if (res.value) {
                                await this.presentLoading('Cerrando sesión...');
                                //Hacer la peticion al backend para remover el refresh token actual
                                const at = JSON.parse(res.value)['accessToken'];
                                //const idUser = JSON.parse(user.value)['id'];
                                const httpOptions = {
                                    headers: new HttpHeaders({
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${at}`
                                    })
                                }
                                this.http.post(`${this.apiURL}/auth/logout`, null, httpOptions).pipe(
                                    tap(_ => {
                                        Preferences.remove({ key: TOKEN_KEY });
                                        this.currentUser.next(false);
                                        this.currentAccessToken = null;
                                        this.router.navigate(['/'], { replaceUrl: true });
                
                                    })
                                ).subscribe(
                                    res => {
                                        this.loadingCtrl.dismiss();
                                    },
                                    async error => {
                                        this.loadingCtrl.dismiss();
                                        const toast = await this.toastCtrl.create({
                                            message: 'Error al cerrar sesión',
                                            duration: 2000,
                                            position: 'bottom'
                                        });
                                        await toast.present();
                                    }
                                );
                            }
                        });
                    }
                }
            ]
        });
        alert.present();


    }

    async presentLoading(mensaje: string) {
        const loading = await this.loadingCtrl.create({
            message: mensaje,
            spinner: 'circles'
        });
        return await loading.present();
    }



    //Metodo para obtener el refreshToken actual y solicitar un nuevo accessToken
    getNewAccessToken() {
        const refreshToken = from(Preferences.get({ key: TOKEN_KEY }));
        return refreshToken.pipe(
            switchMap(user => {
                if (user && user.value) {
                    //Obtener el token de refresco actual, asi como el id del usuario actual
                    const at = JSON.parse(user.value)['accessToken'];
                    //const idUser = JSON.parse(user.value)['id'];
                    const httpOptions = {
                        headers: new HttpHeaders({
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${at}`
                        })
                    }
                    return this.http.post(`${this.apiURL}/auth/refresh`, null, httpOptions);
                } else {
                    // No stored refresh token
                    return of(null);
                }
            })
        );
    }

    //Almacenar los nuevos tokens de acceso y de refresco
    storeNewTokens(accessToken) {
        this.currentAccessToken = accessToken;

        let actualUser;
        Preferences.get({ key: TOKEN_KEY }).then(res => {
            actualUser = JSON.parse(res.value);
            actualUser['accessToken'] = accessToken;
            //actualUser['refreshToken'] = refreshToken;  

            Preferences.set({ key: TOKEN_KEY, value: JSON.stringify(actualUser) });
        });
        return of(null);
    }
}
