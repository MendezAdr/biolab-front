import type { DetalleUpdateDTO } from "./DetalleUpdateDTO";
import type { PagoUpdateDTO } from "./PagoUpdateDTO";

export interface OrdenUpdateDTO {
  id: number;
  numeroFactura: string;
  totalDivisa: number;
  detalles: DetalleUpdateDTO[];
  pagos: PagoUpdateDTO[];
}