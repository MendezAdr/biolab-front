export interface PacienteUpdateDTO {
    Id                 : number;
    Nombre             : string;
    Apellido           : string;
    Cedula             : string;
    Sexo               : string;
    Telefono           : string;
    Direccion          : string;
    NombreAcompanante? : string;
    CedulaAcompanante? : string;
    FechaNacimiento?   : Date;

}