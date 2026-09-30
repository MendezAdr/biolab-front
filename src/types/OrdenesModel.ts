import type { Detalle } from './DetalleModel';
import type { Pago } from './PagoModel';

export interface Orden {
    creadoPorId: number;
    fechaOrden: Date;
    modificadoPorId: number;
    fechaModificacion: Date;
    id: number;
    numeroFactura: string;
    pacienteId: number;
    nombrePaciente: string;
    tasaBcv: number;
    totalBs: number;
    totalDivisa: number;
    detalles: Detalle[];
    pagos: Pago[];
    estado: number;
}