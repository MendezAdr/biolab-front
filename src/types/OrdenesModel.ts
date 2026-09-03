import type { Detalle } from './DetalleModel';
import type { Pago } from './PagoModel';

export interface Orden {
    CreadoPorId: number;
    FechaCreacion: Date;
    ModificadoPorId: number;
    FechaModificacion: Date;

    Id: number;
    NumeroFactura: string;
    PacienteId: number;
    TasaBcv: number;
    TotalBs: number;
    TotalDivisa: number;

    Detalles: Detalle[];
    Pagos: Pago[];
    Estado: number;
}
    