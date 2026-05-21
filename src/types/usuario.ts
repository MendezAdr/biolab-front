export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'Administrador' | 'Bioanalista' | 'Recepcionista'; // Un pseudo-enum limpio
  activo: boolean;
  ultimoAcceso: string;
}