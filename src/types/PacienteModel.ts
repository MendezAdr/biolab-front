export interface Paciente{
    id: number;
    nombre: string;
    apellido: string;
    cedula: string;
    fechaNacimiento: Date;
    sexo: 'M' | 'F';
    telefono: string;
    direccion: string;
    isActive: boolean;

    nombreAcompanante: string;
    cedulaAcompanante: string;

}