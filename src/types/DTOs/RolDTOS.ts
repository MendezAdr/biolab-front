export const PermisosSistema = [
    { id: 0,   nombre: "Ninguno (por defecto)" },
    { id: 1,   nombre: "Gestionar Examenes" },
    { id: 2,   nombre: "Gestionar Presupuestos" },
    { id: 4,   nombre: "Gestionar Pacientes" },
    { id: 8,   nombre: "Gestionar Pagos y Caja" },
    { id: 16,  nombre: "Totalizar" },
    { id: 32,  nombre: "Crear Ordenes y Detalles" },
    { id: 64,  nombre: "Modificar Ordenes y Detalles" },
    { id: 128, nombre: "Ver Reportes Antiguos" },
    { id: 256, nombre: "Gestionar Usuarios" },
    { id: 511, nombre: "Todos los Permisos" }
];

export interface RolCreateDTO {
    nombre: string; 
    permisos: number[];
}

export interface RolUpdateDTO {
    id: number;
    nombre: string; 
    permisos: number[];
}

export interface RolResponseDTO {
    id: number;
    rolName: string; 
    permisos: number[];
}