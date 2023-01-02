import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Quiz } from '../interfaces/quiz.interface';

@Injectable({
    providedIn: 'root'
})

export class QuizService {
    private apiURL = environment.api_url;
    private httpHeader = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    constructor(private http : HttpClient) { }
    
    //Metodo para obtener el detalle des cuestionario a contestar
    getQuiz(){
        return this.http.get(this.apiURL + '/quiz/detail/1', this.httpHeader);
    }

    //Metodo para verificar si la respuesta que selecciono es correcta
    isCorrectAnswer(idQuestion: number, idUserAnswer: number){
        const body = {
            idQuestion : idQuestion,
            idUserAnswer : idUserAnswer
        }
        return this.http.post(`${this.apiURL}/quiz/correct`, body, this.httpHeader);
    }
}
