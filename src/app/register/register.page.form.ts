import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from "@angular/forms";

export class RegisterPageForm {

    private formBuilder: FormBuilder;

    constructor(formBuilder: FormBuilder){
        this.formBuilder = formBuilder;
    }

    createForm() : FormGroup {
        return this.formBuilder.group({
            nombre: ['', [Validators.required]],
            fechaNaci : ['', [Validators.required]],
            genero : ['', [Validators.required]],
            estado : ['', [Validators.required]],
            telefono : ['', [Validators.required, Validators.maxLength(10), Validators.pattern("^[0-9]*$")]]
        });
    }
}