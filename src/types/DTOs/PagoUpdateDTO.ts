import {MetodoPago} from "./MetodoPagoEnum";

export interface PagoUpdateDTO {
    Id : number;
    Monto : number;
    Metodo : MetodoPago;
    Referencia : string;

}