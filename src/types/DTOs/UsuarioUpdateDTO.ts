import type {Rol} from "./RolUsuarioEnum";
export interface UsuarioUpdateDTO {
    Id       : number;
    Username : string;
    Nombre   : string;
    Apellido : string;
    Cedula   : string;
    RolId    : Rol;
}