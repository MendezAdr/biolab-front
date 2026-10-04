import type { Orden } from '../types/OrdenesModel';
import type { Paciente } from '../types/PacienteModel';
import { PagoMetodo } from '../types/PagoModel';

// Interfaces para los diferentes reportes
export interface ReporteCaja {
    fechaGeneracion: Date;
    rango: { inicio: string; fin: string };
    totalOrdenes: number;
    totalEmitidoDivisa: number;  // NUEVO: Valor total de las facturas (Ej. $15)
    deudaGeneradaDivisa: number;
    totalFacturadoDivisa: number;
    totalFacturadoBs: number;
    desglosePorMetodo: { metodoId: number; nombre: string; montoTotal: number }[];
}

export interface ReportePacientes {
    fechaGeneracion: Date;
    totalPacientes: number;
    pacientes: Paciente[];
}

export interface ReporteMorosos {
    fechaGeneracion: Date;
    totalDeudaDivisa: number;
    ordenes: {
        ordenId: number;
        numeroFactura: string;
        pacienteNombre: string;
        pacienteCedula: string;
        fechaEmision: Date;
        totalOrden: number;
        montoPagado: number;
        deudaPendiente: number;
    }[];
}

export const impresionesService = {
    
    // 1. Reporte de Caja (El que ya teníamos, sin cambios mayores)
    generarReporteCaja: (ordenes: Orden[], fechaInicio: string, fechaFin: string): ReporteCaja => {
        let totalDineroIngresadoDivisa = 0;
        let totalDineroIngresadoBs = 0;
        let totalEmitidoDivisa = 0; 
        const sumatoriaMetodos: Record<number, number> = {};

        ordenes.forEach(orden => {
            const totalDivisa = orden.totalDivisa ?? (orden as any).TotalDivisa ?? 0;
            const tasaBcv = orden.tasaBcv ?? (orden as any).TasaBcv ?? 0;

            // Sumamos el valor bruto de la orden procesada
            totalEmitidoDivisa += totalDivisa;

            const listaPagos = orden.pagos || (orden as any).Pagos || [];

            if (listaPagos.length > 0) {
                listaPagos.forEach((pago: any) => {
                    const metodoId = pago.metodo ?? pago.Metodo;
                    const monto = pago.monto ?? pago.Monto ?? 0;

                    if (metodoId) {
                        if (!sumatoriaMetodos[metodoId]) sumatoriaMetodos[metodoId] = 0;
                        sumatoriaMetodos[metodoId] += monto;

                        // Sumamos SOLO el dinero real que entró a caja
                        totalDineroIngresadoDivisa += monto;
                        totalDineroIngresadoBs += (monto * tasaBcv);
                    }
                });
            }
        });

        const desglosePorMetodo = Object.keys(sumatoriaMetodos).map(metodoIdStr => {
            const metodoId = Number(metodoIdStr);
            const nombreMetodo = PagoMetodo.find(m => m.id === metodoId)?.metodo || 'Desconocido';
            return { metodoId, nombre: nombreMetodo, montoTotal: sumatoriaMetodos[metodoId] };
        });

        return {
            fechaGeneracion: new Date(),
            rango: { inicio: fechaInicio, fin: fechaFin },
            totalOrdenes: ordenes.length,
            totalEmitidoDivisa: totalEmitidoDivisa,
            deudaGeneradaDivisa: totalEmitidoDivisa - totalDineroIngresadoDivisa,
            totalFacturadoDivisa: totalDineroIngresadoDivisa,
            totalFacturadoBs: totalDineroIngresadoBs,
            desglosePorMetodo
        };
    },

    // 2. Directorio de Pacientes
    generarReportePacientes: (pacientes: Paciente[]): ReportePacientes => {
        return {
            fechaGeneracion: new Date(),
            totalPacientes: pacientes.length,
            // Ordenamos alfabéticamente por nombre
            pacientes: [...pacientes].sort((a, b) => a.nombre.localeCompare(b.nombre))
        };
    },

    // 3. Reporte de Morosos y Órdenes Pendientes
    // 3. Reporte de Morosos y Órdenes Pendientes (Con Extracción Segura y Matemática Blindada)
    generarReporteMorosos: (ordenes: Orden[], pacientes: Paciente[]): ReporteMorosos => {
        let totalDeuda = 0;
        const ordenesMapeadas: any[] = [];

        ordenes.forEach(orden => {
            // 1. Extracción segura de la orden (Soporta camelCase y PascalCase)
            const estado = orden.estado ?? (orden as any).Estado;
            const estadoPago = orden.estadoPago ?? (orden as any).EstadoPago;
            const totalDivisa = orden.totalDivisa ?? (orden as any).TotalDivisa ?? 0;
            const pacienteId = orden.pacienteId ?? (orden as any).PacienteId;
            const numeroFactura = orden.numeroFactura ?? (orden as any).NumeroFactura ?? 'N/A';
            const fechaOrden = orden.fechaOrden ?? (orden as any).FechaOrden ?? orden.fechaOrden ?? (orden as any).FechaOrden ?? new Date();

            // 2. Cálculo seguro y real de los pagos
            const listaPagos = orden.pagos || (orden as any).Pagos || [];
            const totalPagado = listaPagos.reduce((acc: number, p: any) => {
                const montoPago = Number(p.monto ?? p.Monto) || 0;
                return acc + montoPago;
            }, 0);

            // 3. Matemática estricta
            const deudaReal = totalDivisa - totalPagado;

            // 4. DOBLE VALIDACIÓN: 
            // Consideramos moroso a quien tenga un estado deudor (2 o 3) 
            // *PERO* la deuda real matemática debe ser estrictamente mayor a 0.
            const etiquetaMoroso = (estado === 2 || estado === 3 || estadoPago === 2 || estadoPago === 3);

            // Usamos > 0.01 para evitar los errores de decimales "flotantes" de JavaScript (ej. 0.00000001)
            if (etiquetaMoroso && deudaReal > 0.01) {
                
                // Extracción segura del paciente
                const paciente = pacientes.find(p => (p.id ?? (p as any).Id) === pacienteId);
                const pacienteNombre = paciente?.nombre ?? (paciente as any)?.Nombre;
                const pacienteApellido = paciente?.apellido ?? (paciente as any)?.Apellido;
                const pacienteCedula = paciente?.cedula ?? (paciente as any)?.Cedula;
                
                totalDeuda += deudaReal;

                ordenesMapeadas.push({
                    ordenId: orden.id ?? (orden as any).Id,
                    numeroFactura: numeroFactura,
                    pacienteNombre: paciente ? `${pacienteNombre} ${pacienteApellido}`.trim() : 'Desconocido',
                    pacienteCedula: paciente ? pacienteCedula : 'N/A',
                    fechaEmision: new Date(fechaOrden),
                    totalOrden: totalDivisa,
                    montoPagado: totalPagado,
                    deudaPendiente: deudaReal
                });
            }
        });

        return {
            fechaGeneracion: new Date(),
            totalDeudaDivisa: totalDeuda,
            // Ordenamos por los más antiguos primero
            ordenes: ordenesMapeadas.sort((a, b) => a.fechaEmision.getTime() - b.fechaEmision.getTime())
        };
    }
};