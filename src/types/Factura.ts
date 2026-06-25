export interface Factura {
  id: number;
  referencia: string;
  TotalDolares: number;
  descripcion: string;
  fecha: string; // ISO 8601, e.g., "2026-06-14T08:00:00"
}