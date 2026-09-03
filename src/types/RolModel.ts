export interface Rol{
    Id: number;
    RolName: string;
    Permisos: number[]; // Array de IDs de permisos asociados al rol
} 