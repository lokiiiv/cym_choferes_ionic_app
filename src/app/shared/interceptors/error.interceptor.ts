import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError, EMPTY, of } from 'rxjs'
import { catchError, retry} from 'rxjs/operators'

@Injectable()
export class ErrorIntercept implements HttpInterceptor {

    intercept (request: HttpRequest<any>, next: HttpHandler) : Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                retry(1),
                catchError(error => {
                    if(error.error instanceof ErrorEvent) {
                         //Errores del lado del cliente
                         console.log('Error del cliente', error)
                         return throwError(error.error.message);
                    } else {
                       //Errores del lado del servidor
                         //Omitir el error 401 debido ya que el jwtInterceptor ya lo maneja
                         if(error.status === 401) {
                            console.log('Error interceptor, 401 error, omitir, jwtinterceptor se encargara');
                             return of(error);
                         } else {
                             console.log('Error del servidor', error.status);
                             if(error.error.msg) {
                                 return throwError(error.error.msg);
                             } else {
                                 return throwError('Sugió un error, intente más tarde.');
                             }
                         }
                    }
                })
            )
    }
}