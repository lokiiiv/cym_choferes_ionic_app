import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ItemUser, DetailUser, StatusChofer } from '../interfaces/user.interface';

@Injectable({
    providedIn: 'root'
})

export class UserService {
    private apiURL = environment.api_url;
    private httpHeader = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    constructor(private http : HttpClient) { }

    //Metodo para obtener los requerimientos del un chofer
    public verificarRequerimientos(idUser){
        return this.http.get(this.apiURL + '/user/requerimientos/' + idUser, this.httpHeader);
    }

    //Metodo para consultar informacion basica de un chofer
    public getBasicChofer(idUser) {
        return this.http.get(this.apiURL + '/user/info/chofer/basic/' + idUser, this.httpHeader);
    }

    //Metodo para consultar información basica de un administrador
    public getBasicAdmin(idUser, body) {
        return this.http.post(this.apiURL + '/user/info/admin/basic/' + idUser, body, this.httpHeader);
    }

    //Metodo para actualizar que el usuario ya contesto el cuestionario
    public setFinishedQuiz(idUser) {
        return this.http.put(`${this.apiURL}/user/requerimientos/update/quiz/${idUser}`, null, this.httpHeader);
    }

    //Metodo para actualizar que el usuario ya vio completamente el video
    public setFinishedVideo(idUser) {
        return this.http.put(`${this.apiURL}/user/requerimientos/update/video/${idUser}`, null, this.httpHeader);
    }

    //Metodo para actualizar que el usuario ya subio toda su documentacion
    public setFinishedDocs(idUser) {
        return this.http.put(`${this.apiURL}/user/requerimientos/update/docs/${idUser}`, null, this.httpHeader);
    }

    //Metodo para obtener información basica de todos los choferes
    public getAllBasicChoferes() {
        return this.http.get(`${this.apiURL}/user/all/choferes`, this.httpHeader);
    }

    //Metodo para obtener el detalle de un chofer
    public getDetailChofer(idUser) {
        return this.http.get<DetailUser>(`${this.apiURL}/user/chofer/detail/${idUser}`, this.httpHeader);
    }

    //Metodo para obtener el estatus actual del chofer
    public getStatusChofer(idUser) {
        return this.http.get<StatusChofer>(`${this.apiURL}/user/estatus/chofer/${idUser}`, this.httpHeader);
    }

    //Metodo para actualizar el estatus de un chofer
    public setEstatus(estatus: string, idUser: number) {
        return this.http.put(`${this.apiURL}/user/chofer/update/estatus/${idUser}/${estatus}`, null, this.httpHeader);
    }

    //Metodo para vetar o deshabilitar a un chofer
    public deshabilitarChofer(idUser: number, body) {
        return this.http.put(`${this.apiURL}/user/chofer/deshabilitar/${idUser}`, body, this.httpHeader);
    }

    //Metodo para habilitar al chofer
    public habilitarChofer(idUser) {
        return this.http.put(`${this.apiURL}/user/chofer/habilitar/${idUser}`, null, this.httpHeader);
    }


    //Metodo para obtener los usuarios que no son choferes
    public getNoChoferes(){
        return this.http.get(`${this.apiURL}/user/no-choferes`, this.httpHeader);
    }
    //Meotodo para obtener un usuario que no es chofer por su id
    public getUserById(idUser) {
        return this.http.get(`${this.apiURL}/user/no-chofer/get/${idUser}`, this.httpHeader);
    }
    //Metodo para agregar un nuevo usuario que no es chofer
    public addNoChofer(body) {
        return this.http.post(`${this.apiURL}/user/save-no-chofer`, body, this.httpHeader);
    }
    //Metodo para eliminar un usuario que no es chofer
    public deleteUser(idUser) {
        return this.http.delete(`${this.apiURL}/user/delete/${idUser}`, this.httpHeader);
    }
    //Metodo para editar un usuario
    public editUser(idUser, body) {
        return this.http.put(`${this.apiURL}/user/edit/${idUser}`, body, this.httpHeader);
    }


    //Metodo para obtener a los choferes que tengan fechas de documentos vencidos
    public getChoferVencidos() {
        return this.http.get(`${this.apiURL}/user/docs/no-vigentes`, this.httpHeader);
    }
}
