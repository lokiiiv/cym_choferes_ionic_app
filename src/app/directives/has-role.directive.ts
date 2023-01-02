import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { filter, take, map } from 'rxjs/operators'

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {

  @Input('appHasRole') roles: string[];

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
    ) { }


  ngOnInit(): void {
    this.authService.getUser()
      .pipe(
        filter(val => val !== null),
        take(1),
        map(user => {
          //Obtener el rol del usuario actual
          let rol = user['rol'];
          if(this.roles.includes(rol)) {
            //Si el rol del usuario actual esta incluido en la lista de roles permitidos para este componente mostrarlo
            this.viewContainer.createEmbeddedView(this.templateRef);
          } else {
            this.viewContainer.clear();
          }
        })
      )
      .subscribe();
  }

}
