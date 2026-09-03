export interface Paciente{
    Id: number;
    Nombre: string;
    Apellido: string;
    Cedula: string;
    FechaNacimiento: Date;
    Sexo: 'M' | 'F';
    Telefono: string;
    Direccion: string;
    IsActive: boolean;

    NombreAcompanante: string;
    CedulaAcompanante: string;

}