import type { DetalleUpdateDTO } from "./DetalleUpdateDTO";
import type { PagoUpdateDTO } from "./PagoUpdateDTO";


export interface OrdenUpdateDTO {
  
  Id            : number;
  NumeroFactura : string;
  TotalDivisa   : number;
  Detalles      : DetalleUpdateDTO[];
  Pagos          : PagoUpdateDTO[];
}