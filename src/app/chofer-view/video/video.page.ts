import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { UserService } from '../../shared/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
})
export class VideoPage implements OnInit, AfterViewInit {

  public videoSource: string = "./assets/video/vid_prueba.mp4";

  private timeStarted: number = -1;
  private timePlayed: number = 0;
  private duration: number = 0;
  private playedFor: number = 0;

  @ViewChild('videoPlayer') video: ElementRef<HTMLVideoElement>;

  constructor(
    private alertCtrl: AlertController,
    private userSvc: UserService,
    private router: Router,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    
    this.video.nativeElement.addEventListener('loadedmetadata', (event) => {
      this.duration = this.video.nativeElement.duration;

      this.video.nativeElement.addEventListener("play", e => this.videoStartedPlaying());
      this.video.nativeElement.addEventListener("playing", e => this.videoStartedPlaying());

      this.video.nativeElement.addEventListener("ended",  e => this.videoStoppedPlaying(e));
      this.video.nativeElement.addEventListener("pause", e => this.videoStoppedPlaying(e));
    });

    
  }

  // remember time user started the video
  videoStartedPlaying() {
    this.timeStarted = new Date().getTime()/1000;
  }

  async videoStoppedPlaying(event) {
    // Start time less then zero means stop event was fired vidout start event
    if(this.timeStarted > 0) {
      this.playedFor =  new Date().getTime()/1000 - this.timeStarted;
      this.timeStarted = -1;
      // add the new number of seconds played
      this.timePlayed += this.playedFor;
    }

    // Count as complete only if end of video was reached
    if(this.timePlayed >= this.duration && event.type=="ended") {
      //Termino de ver el video, mostrar mensaje y actualizar en la base de datos
      this.timePlayed = 0;
      this.setVideo();

    } else {
      if(event.type == "ended"){
        const alert = await this.alertCtrl.create({
          header: 'Alerta',
          message: '¡No ha terminado de ver el video completo!',
          buttons: ['OK'],
          backdropDismiss: false
        });
        await alert.present();
      }
    }
  }

  setVideo() {
    const idUser = localStorage.getItem('id');
    this.userSvc.setFinishedVideo(idUser)
      .subscribe(
        async (res) => {
          if(res['res']){

            const alert = await this.alertCtrl.create({
              header: 'Aviso',
              message: res['msg'],
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
}
