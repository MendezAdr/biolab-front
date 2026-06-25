
export interface Paciente {
  id: number;
  nombre: string;
  cedula: string;
  estado: 'Pendiente' | 'En Proceso' | 'Completado';
  fecha: string; // ISO 8601, e.g., "2023-12-12T00:00:00"
}