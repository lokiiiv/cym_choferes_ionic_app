import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../../environments/environment';
import { AllAttendances, LastAttendance } from '../interfaces/attendance.interface';

@Injectable({
    providedIn: 'root'
})

export class AsistenciaService {
    private apiURL = environment.api_url;
    private httpHeader = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    constructor(private http : HttpClient) { }

    // //Metodo para registrar la entrada y obtener la informacion del chofer
    // public registrar(url, body){
    //     return this.http.post(url, body, this.httpHeader);
    // }

    //Metodo para registrar un nuevo flujo o ruta de los choferes y registrar su entrada
    public registrarEntrada(dataBody) {
        return this.http.post(`${this.apiURL}/ruta/nueva`, dataBody, this.httpHeader);
    }

    //Metodo para obtener los flujos actuales de cebada, malta, etc
    public getRutas() {
        return this.http.get(`${this.apiURL}/ruta/todas`);
    }

    //Metodo para registrar un movimiento de cebada por primera vez
    public registrarMovimientoCebada(dataBody, idRuta) {
        return this.http.post(`${this.apiURL}/ruta/cebada/agregar/${idRuta}`, dataBody, this.httpHeader);
    }
    //Metodo para registrar un movimiento de cebada si el chofer esta como incompleto
    public registrarMovimientoCebadaIncompleto(dataBody, idRuta) {
        return this.http.post(`${this.apiURL}/ruta/cebada/agregar/incompleto/${idRuta}`, dataBody, this.httpHeader);
    }

    //Metodo para registrar el movmiento en caso de que no se haya registrado un anterior o se haya olvidado registrar
    public registrarMovimientoCebadaForzar(dataBody, idRuta) {
        return this.http.post(`${this.apiURL}/ruta/cebada/agregar/forzar/${idRuta}`, dataBody, this.httpHeader);
    }


    public registrarMovimientoMalta(dataBody, idRuta) {
        return this.http.post(`${this.apiURL}/ruta/malta/agregar/${idRuta}`, dataBody, this.httpHeader);
    }
    public registrarMovimientoMaltaIncompleto(dataBody, idRuta) {
        return this.http.post(`${this.apiURL}/ruta/malta/agregar/incompleto/${idRuta}`, dataBody, this.httpHeader);
    }
    public registrarMovimientoMaltaForzar(dataBody, idRuta) {
        return this.http.post(`${this.apiURL}/ruta/malta/agregar/forzar/${idRuta}`, dataBody, this.httpHeader);
    }


    public registrarMovimientoCoproducto(dataBody, idRuta) {
        return this.http.post(`${this.apiURL}/ruta/coproducto/agregar/${idRuta}`, dataBody, this.httpHeader);
    }
    public registrarMovimientoCoproductoIncompleto(dataBody, idRuta) {
        return this.http.post(`${this.apiURL}/ruta/coproducto/agregar/incompleto/${idRuta}`, dataBody, this.httpHeader);
    }
    public registrarMovimientoCoproductoForzar(dataBody, idRuta) {
        return this.http.post(`${this.apiURL}/ruta/coproducto/agregar/forzar/${idRuta}`, dataBody, this.httpHeader);
    }

    


    //Metodo para registrar la salida
    public registrarSalida(dataBody, idRuta) {
        return this.http.post(`${this.apiURL}/ruta/agregar/salida/${idRuta}`, dataBody, this.httpHeader);
    }



    //Metodo para obtener la ultima asistencia del usuario
    public getLastAttendance(idUser) {
        return this.http.get(`${this.apiURL}/attendance/last-attendance/${idUser}`, this.httpHeader);
    }

    //Metodo para obtener todas las asistencias de un chofer
    public getAllAttendances(idUser) {
        return this.http.get(`${this.apiURL}/attendance/chofer/${idUser}`, this.httpHeader);
    }
}
