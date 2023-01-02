export interface ItemUser {
    idUser: number;
    nombreCompleto: string;
    empresaTransportista: string;
    estatus: string;
    foto: string;
}

export interface DetailUser {
    nombreCompleto: string;
    clave: string;
    rol: string;
    fechaNacimiento: string;
    edad: number;
    fechaRegistro: string;
    genero: string;
    empresaTransportista: string;
    estadoProcedencia: string;
    foto: string;
    telefonoCelular: string;
    telefonoContactoEmpresa: string;
    estatus: string;
    verVideo: number;
    contestarQuiz: number;
    subirDocs: number;
}

export interface StatusChofer {
    nombreCompleto: string;
    edad?: number;
    estadoProcedencia: string;
    foto: string;
    empresaTransportista: string;
    estatus: string;
}