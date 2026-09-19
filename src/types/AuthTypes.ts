export interface UsuarioLogueado {
    id: number;
    username: string;
    nombre: string;
    apellido: string;
    rolNombre: string;
    permisos: number[]; // El arreglo que ya viene de tu DTO: ej. [1, 16, 64]
}

// Estos números coinciden con tu enum PermisosSistema del backend
export const PERMISOS = {
    NINGUNO: 0,
    GESTIONAR_EXAMENES: 1,
    GESTIONAR_PRESUPUESTOS: 2,
    MODIFICAR_PACIENTES: 4,
    GESTIONAR_PAGOS: 8,
    TOTALIZAR: 16,
    CREAR_ORDENES_Y_DETALLES: 32,
    MODIFICAR_ORDENES_Y_DETALLES: 64,
    VER_REPORTES: 128,
    GESTIONAR_USUARIOS: 256,
    TODOS: 511
};