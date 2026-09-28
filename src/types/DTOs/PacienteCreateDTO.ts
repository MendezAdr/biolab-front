export interface PacienteCreateDTO {
    nombre: string;
    apellido: string;
    cedula: string;
    sexo: string;
    telefono: string;
    direccion: string;
    nombreAcompanante?: string;
    cedulaAcompanante?: string;
    fechaNacimiento?: Date;
}

export interface PacienteUpdateDTO extends PacienteCreateDTO {
    id: number;
}