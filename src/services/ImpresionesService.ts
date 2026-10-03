import type { Orden } from '../types/OrdenesModel';
import type { Paciente } from '../types/PacienteModel';
import { PagoMetodo } from '../types/PagoModel';

// Interfaces para los diferentes reportes
export interface ReporteCaja {
    fechaGeneracion: Date;
    rango: { inicio: string; fin: string };
    totalOrdenes: number;
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
        let totalFacturadoDivisa = 0;
        let totalFacturadoBs = 0;
        const sumatoriaMetodos: Record<number, number> = {};

        ordenes.forEach(orden => {
            totalFacturadoDivisa += orden.totalDivisa;
            totalFacturadoBs += (orden.totalDivisa * orden.tasaBcv);
            if (orden.pagos && orden.pagos.length > 0) {
                orden.pagos.forEach(pago => {
                    if (!sumatoriaMetodos[pago.metodo]) sumatoriaMetodos[pago.metodo] = 0;
                    sumatoriaMetodos[pago.metodo] += pago.monto;
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
            totalFacturadoDivisa,
            totalFacturadoBs,
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
    generarReporteMorosos: (ordenes: Orden[], pacientes: Paciente[]): ReporteMorosos => {
        const ordenesPendientes = ordenes.filter(o => {
            // Asumiendo que 2 = Pendiente y 3 = Parcial en tu EstadoPagoEnum
            return o.estado === 2 || o.estado === 3 ;
        });

        let totalDeuda = 0;

        const ordenesMapeadas = ordenesPendientes.map(orden => {
            const paciente = pacientes.find(p => p.id === orden.pacienteId);
            const totalPagado = orden.pagos?.reduce((acc, p) => acc + p.monto, 0) || 0;
            const deuda = orden.totalDivisa - totalPagado;
            
            totalDeuda += deuda;

            return {
                ordenId: orden.id,
                numeroFactura: orden.numeroFactura,
                pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Desconocido',
                pacienteCedula: paciente ? paciente.cedula : 'N/A',
                fechaEmision: new Date(orden.fechaOrden),
                totalOrden: orden.totalDivisa,
                montoPagado: totalPagado,
                deudaPendiente: deuda
            };
        });

        return {
            fechaGeneracion: new Date(),
            totalDeudaDivisa: totalDeuda,
            // Ordenamos por los más antiguos primero
            ordenes: ordenesMapeadas.sort((a, b) => a.fechaEmision.getTime() - b.fechaEmision.getTime())
        };
    }
};