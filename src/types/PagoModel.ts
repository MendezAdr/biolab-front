export interface Pago {
    id: number;
    ordenId: number;
    monto: number;
    metodo: number;
    referencia: string;
    creadoPor: number;
    fechaCreacion: string;
    modificadoPor?: number;
    fechaModificacion?: string;
}

export const PagoMetodo =  [
    { id: 1, metodo: "Punto de Venta" },
    { id: 2, metodo: "Pago Móvil" },
    { id: 3, metodo: "BioPago" },
    { id: 4, metodo: "Efectivo (Bs)" },
    { id: 5, metodo: "Divisas" },
    { id: 6, metodo: "Transferencia" }
];