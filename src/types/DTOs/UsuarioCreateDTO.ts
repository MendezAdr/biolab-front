import type {Rol} from "./RolUsuarioEnum";

export interface UsuarioCreateDTO {
    Username   : string;
    Nombre     : string;
    Apellido   : string;
    Cedula     : string;
    Contrasena : string;
    RolId      : Rol;
}