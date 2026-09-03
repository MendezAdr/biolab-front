// src/types/DTOs/PagoStandaloneCreateDTO.ts


export interface PagoStandaloneCreateDTO {
    OrdenId    : number; // Vital para saber a qué factura se le está abonando
    Monto      : number;
    Metodo     : number;
    Referencia : string;
}