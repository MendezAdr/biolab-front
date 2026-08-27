export const EstadoPago = {
    Pagado    : 1,
    Pendiente : 2,
    parcial   : 3,
    Cancelado : 4
} as const;

export type EstadoPago = typeof EstadoPago[keyof typeof EstadoPago];