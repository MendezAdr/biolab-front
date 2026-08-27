export interface PacienteCreateDTO {

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