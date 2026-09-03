// src/types/PagoModel.ts

export interface Pago {
    Id: number;
    OrdenId: number;
    Monto: number;
    Metodo: number; // CORRECCIÓN: El backend envía un número entero
    Referencia: string;
}

// Este es tu diccionario de traducción
export const PagoMetodo =  [
    { id: 1, metodo: "Punto de Venta" },
    { id: 2, metodo: "Pago Móvil" },
    { id: 3, metodo: "BioPago" },
    { id: 4, metodo: "Efectivo (Bs)" },
    { id: 5, metodo: "Divisas" },
    { id: 6, metodo: "Transferencia" }
];