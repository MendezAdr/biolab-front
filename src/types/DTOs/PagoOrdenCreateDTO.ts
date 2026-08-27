import {MetodoPago} from "./MetodoPagoEnum";

export interface PagoOrdenCreateDTO{
    Monto      : number;
    Metodo     : MetodoPago;
    Referencia : string;
    
}