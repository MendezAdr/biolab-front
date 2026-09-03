export interface Usuario{
 CreadoPorId: number;
 FechaCreacion: Date;
    ModificadoPorId: number;
    FechaModificacion: Date;
    
    Id: number;
    Username : string;
    Nombre: string;
    Apellido: string;
    Cedula: string;
    Contrasena: string;
    IsActive: boolean;
    RolId: number;
}