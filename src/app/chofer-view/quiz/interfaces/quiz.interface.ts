export interface Quiz {
    idQuiz : number,
    nombre : string,
    puntajeTotal : number
    preguntas : Question[]
}

export interface Question{
    idQuestion : number, 
    tipo: string,
    puntaje : string,
    contenido : string,
    respuestas : Answer[]
}

export interface Answer{
    idAnswer : number,
    contenido : string
}