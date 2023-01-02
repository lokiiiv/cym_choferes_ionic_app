import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Document } from '../interfaces/document.interface';

@Injectable({
  providedIn: 'root'
})
export class DocsService {
  private apiURL = environment.api_url;
  private httpHeader = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  constructor(
    private http: HttpClient
  ) { }

  //Metodo para obtener que documentos son lo que estan permitidos subir por el chofer
  public getDocumentos(id) {
    return this.http.get(`${this.apiURL}/document/get/permitidos/${id}`, this.httpHeader);
  }

  public getDocumentosDisponibles(){
    return this.http.get(`${this.apiURL}/document/get`, this.httpHeader);
  }

  //Metodo para agregar un nuevo documento que debe subir el chofer
  public nuevoDoc(body) {
    return this.http.post(`${this.apiURL}/document/add`, body, this.httpHeader);
  }

  //Metodo para subir los archivos y gurdarlos en base de datos
  public uploadDocs(formData){

    const req = new HttpRequest('POST', `${this.apiURL}/document/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    })
    return this.http.request(req);
  }

  //Metodo para obtener los documentos de un usuario
  public getDocuments(userId) {
    return this.http.get(`${this.apiURL}/document/get/${userId}`, this.httpHeader);
  }

  //Método para eliminar un documento que ya no se desea que el chofer suba al sistema
  public eliminarDocumento(idDoc) {
    return this.http.delete(`${this.apiURL}/document/delete/${idDoc}`, this.httpHeader);
  }
}
