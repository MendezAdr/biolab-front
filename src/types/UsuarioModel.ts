export interface Usuario {
    creadoPorId: number;
    fechaCreacion: Date;
    modificadoPorId: number;
    fechaModificacion: Date;
    id: number;
    username: string;
    nombre: string;
    apellido: string;
    cedula: string;
    contrasena: string;
    isActive: boolean;
    rolId: number;
}