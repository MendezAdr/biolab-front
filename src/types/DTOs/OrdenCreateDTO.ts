import type { DetalleCreateDTO } from "./DetalleCreateDTO";
import type { PagoOrdenCreateDTO } from "./PagoOrdenCreateDTO";

export interface OrdenCreateDTO {
    NumeroFactura : string;
    PacienteId    : number;
    TotalDivisa   : number;
    TasaBCV       : number;
    Fecha         : Date;
    Detalles      : DetalleCreateDTO[];
    Pagos         : PagoOrdenCreateDTO[];
}
