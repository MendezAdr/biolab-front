import type { DetalleCreateDTO } from "./DetalleCreateDTO";
import type { PagoOrdenCreateDTO } from "./PagoOrdenCreateDTO";

export interface OrdenCreateDTO {
    numeroFactura: string;
    pacienteId: number;
    totalDivisa: number;
    tasaBcv: number;
    fecha: Date;
    detalles: DetalleCreateDTO[]; // Asegúrate de que DetalleCreateDTO también esté en camelCase
    pagos: PagoOrdenCreateDTO[];
}