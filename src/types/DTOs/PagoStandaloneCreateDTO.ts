// src/types/DTOs/PagoStandaloneCreateDTO.ts
import type { MetodoPago } from "./MetodoPagoEnum";

export interface PagoStandaloneCreateDTO {
    OrdenId    : number; // Vital para saber a qué factura se le está abonando
    Monto      : number;
    Metodo     : MetodoPago;
    Referencia : string;
}