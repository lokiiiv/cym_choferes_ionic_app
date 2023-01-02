import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { BlobErrorHttpInterceptor } from './shared/interceptors/blob.error.http.interceptor';
import { ErrorIntercept } from './shared/interceptors/error.interceptor';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { SharedDirectivesModule } from './directives/shared-directives.module';


@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  providers: [{ 
      provide: RouteReuseStrategy, useClass: IonicRouteStrategy 
    }, 
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorIntercept,
      multi: true
    },
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: JwtInterceptor, 
      multi: true 
    }, 
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BlobErrorHttpInterceptor,
      multi: true
    },
    
    FileOpener],
  bootstrap: [AppComponent],
})
export class AppModule {}
