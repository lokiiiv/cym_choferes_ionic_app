import { Component, OnInit } from '@angular/core';
import { Answer, Question } from './interfaces/quiz.interface';
import { QuizService } from './services/quiz.service';
import { UserService } from 'src/app/shared/services/user.service';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
})
export class QuizPage implements OnInit {

  public questionList: Question[];
  public preguntaActual: string;
  public answers: Answer[];
  public totalPreguntas: number;
  public que_count: number = 0;
  public preguntasCorrectas: number = 0;

  public idUserAnswer: number;

  public idAnswerCorrect: number;

  public disabled: boolean;

  public isAnswered: boolean;

  constructor(
    private quizSvc: QuizService,
    private userSvc: UserService,
    private toastCtrl: ToastController,
    private allertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) { 

    //Obtener la spreguntas del cuestionario y mostrarlas
    this.obtenerPreguntas();
  }

  ngOnInit() {
  }

  obtenerPreguntas() {
    this.quizSvc.getQuiz()
      .subscribe(
        (res) => {
          let quiz = res['data'];
          //Mostrar las preguntas y sus posibles respuestas
          this.questionList = quiz.preguntas;
          //Obtener la cantidad de preguntas en el quiz
          this.totalPreguntas = quiz.preguntas.length;
          this.showQuestions(0);
        },
        async (error) => {
          const toast = await this.toastCtrl.create({
              message: error,
              duration: 1500,
              position: 'bottom'
            });
            await toast.present();
          }
      )
  }

  showQuestions(index: number){
    //Mostrar la pregunta conforme se va avanzando
    this.preguntaActual = this.questionList[index].contenido;

    //Mostrar las posibles respuestas de la pregunta
    this.answers = this.questionList[index].respuestas;
  }

  async optionSelected(opcion: Answer){
    await this.presentLoading();
    //Aqui se recibe el objeto correspondiente a la respuesta que selecciono el usuario

    //Obtener el id de la pregunta actual
    let idActualQuestion = this.questionList[this.que_count].idQuestion;
    //Obtener el id de la respuesta que selecciono el usuario
    this.idUserAnswer = opcion.idAnswer;
    //Obtener la respuesta del servicio para verificar si el usuario contesto correctamente
    this.quizSvc.isCorrectAnswer(idActualQuestion, this.idUserAnswer)
      .subscribe(
        (res) => {
          //Si la respuesta es correcta
          if(res['data'].correcto){
            //Actualizar el puntaje
            this.preguntasCorrectas++;
            //Obtener de la respuesta cual es el ID de la pregunta correcta
            this.idAnswerCorrect = res['data'].idAnswerCorrect;
          } else {
            //Si no es correcto, mostrar el id de la respuesta correcta
            this.idAnswerCorrect = res['data'].idAnswerCorrect;
          }

          //Actualizar la propiedad para deshabilitar las opciones luego de contestar la pregunta
          this.disabled = true;

          //Actualizar la propiedad indicando que la pregunta fue contestada correctamente
          this.isAnswered = true;

          this.loadingCtrl.dismiss();
        },
        async (error) => {
          this.loadingCtrl.dismiss();
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 1500,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  async nextQuestion() {
    if(this.questionList != undefined) { 
      //Verificar si se contesto la pregunta
      if(this.isAnswered) {

        //Volver a actualizar la propiedad indicando que la pregunta no se ha contestado, esto debido a que es nuevo pregunta
        this.isAnswered = false;

        if(this.que_count < this.questionList.length - 1){
          this.que_count++;
          this.disabled = false;
          this.idAnswerCorrect = undefined;
          this.showQuestions(this.que_count);
        } else {
            //Calcular el puntaje y obtener si aprobo o no
            let porcentaje = (this.preguntasCorrectas * 100) / this.totalPreguntas;
            if(porcentaje >= 70) {
              //Actualizar que ya se contesto el cuestionario
              this.setQuiz(porcentaje);
            } else {
              const alert = await this.allertCtrl.create({
                header: 'Aviso',
                message: '¡No aprobaste el cuestionario! Obtuviste un ' + porcentaje + '%. Vuelve a intentar.',
                buttons: [
                  {
                    text : 'OK',
                    role : 'confirm'
                  }
                ],
                backdropDismiss: false
              });
              await alert.present();
              const { role } = await alert.onWillDismiss();
              if(role === 'confirm') {
                this.que_count = 0;
                this.preguntasCorrectas = 0;
                this.totalPreguntas = 0;
                this.disabled = false;
                this.isAnswered = false;
                this.idUserAnswer = undefined;
                this.idAnswerCorrect = undefined;
                this.obtenerPreguntas();
              }
            }
        }
      } else {
        const alert = await this.allertCtrl.create({
          header: 'Alerta',
          message: '¡Debe contestar la pregunta actual antes de pasar a la siguiente!',
          buttons: ['OK'],
          backdropDismiss: false
        });
        await alert.present();
      }
    }
  }

  setQuiz(porcentaje) {
    const idUser = localStorage.getItem('id');
    this.userSvc.setFinishedQuiz(idUser)
      .subscribe(
        async (res) => {
          if(res['res']){

            const alert = await this.allertCtrl.create({
              header: 'Aviso',
              message: '¡Haz aprobado el cuestionario con un ' + porcentaje + '%!',
              buttons: [
                {
                  text : 'OK',
                  role : 'confirm'
                }
              ],
              backdropDismiss: false
            });
            await alert.present();
            const { role } = await alert.onWillDismiss();
            if(role === 'confirm') {
              this.router.navigate(['/chofer-tabs'], { replaceUrl: true });
            }
          }
        },
        async (error) => {
          const toast = await this.toastCtrl.create({
            message: error,
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      )
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: 'circles',
      message: 'Verificando...',
    });
    return await loading.present();
  }
}
