// src/types/DTOs/PagoStandaloneCreateDTO.ts


export interface PagoStandaloneCreateDTO {
    ordenId    : number; // Vital para saber a qué factura se le está abonando
    monto      : number;
    metodo     : number;
    referencia : string;
}