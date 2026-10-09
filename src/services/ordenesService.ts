import { apiClient } from '../config/ApiClient'; 
import { AppConfig } from '../config/ApiClient';
import type { OrdenCreateDTO } from '../types/DTOs/OrdenCreateDTO'; 
import type { OrdenUpdateDTO } from '../types/DTOs/OrdenUpdateDTO';
import { EstadoPago } from '../types/DTOs/EstadoPagoEnum'; 

const ordenesMockData = [
    {
        id: 1,
        pacienteId: 1,
        fechaCreacion: '2024-01-15T10:30:00Z',
        totalDivisa: 150.00,
        estadoPago: EstadoPago.Pagado,
        numeroFactura: 'FAC-001',
        tasaBcv: 100.11,
        detalles: [
            { id: 1, ordenId: 1, examenId: 101, examenNombre: "Examen 1", precioMomentoDivisa: 50.00},
            { id: 2, ordenId: 1, examenId: 102, examenNombre: "Examen 2", precioMomentoDivisa: 100.00 }
        ],
        pagos: [
            { id: 1, ordenId: 1, monto: 150.00, metodo: 1, referencia: 'ABC123XYZ' }
        ]
    },
    {
        id: 2,
        pacienteId: 2,
        fechaCreacion: '2024-01-16T11:00:00Z',
        totalDivisa: 200.00,
        estadoPago: EstadoPago.Pendiente,
        numeroFactura: 'FAC-002', 
        tasaBcv: 100.11,
        detalles: [
            { id: 3, ordenId: 2, examenId: 103, examenNombre: "Examen 3", precioMomentoDivisa: 200.00 }
        ],
        pagos: []
    }
];


const normalizarOrden = (o: any) => {
    return {
        ...o,
        // Estandarización a camelCase forzada
        id: o.id ?? o.Id,
        numeroFactura: o.numeroFactura ?? o.NumeroFactura,
        pacienteId: o.pacienteId ?? o.PacienteId,
        fechaOrden: o.fechaOrden ?? o.FechaOrden ?? o.fechaCreacion ?? o.FechaCreacion,
        totalDivisa: Number(o.totalDivisa ?? o.TotalDivisa ?? 0),
        tasaBcv: Number(o.tasaBcv ?? o.TasaBcv ?? 0),
        estado: o.estado ?? o.Estado,
        estadoPago: o.estadoPago ?? o.EstadoPago ?? o.estado ?? o.Estado, // Fallback mutuo
        // Arreglos
        detalles: o.detalles ?? o.Detalles ?? [],
        pagos: o.pagos ?? o.Pagos ?? []
    };
};

// Interceptor de Errores 400 (Validación Automática de ASP.NET Core)
const manejarErrorHttp = (error: any, mensajePorDefecto: string) => {
    if (error.response?.status === 400 && error.response?.data?.errors) {
        const errores = error.response.data.errors;
        const campo = Object.keys(errores)[0];
        let mensajeValidacion = errores[campo][0];

        if (mensajeValidacion.includes("is required")) {
            mensajeValidacion = "Este campo es obligatorio.";
        } else if (mensajeValidacion.includes("maximum length")) {
            const match = mensajeValidacion.match(/maximum length of '(\d+)'/);
            const limite = match ? match[1] : "permitidos";
            mensajeValidacion = `No puede exceder los ${limite} caracteres.`;
        }

        throw new Error(`Error en '${campo}': ${mensajeValidacion}`);
    }

    const data = error.response?.data;
    const mensajeBackend = data?.Message ?? data?.message ?? data?.Mensaje ?? data?.mensaje;
    throw new Error(mensajeBackend || error.message || mensajePorDefecto);
};

export const ordenesService = {
    getAll: async (adminId: number) => {
        if (AppConfig.usarMocks) return [];
        try {
            const response = await apiClient.get('/ordenes', { headers: { 'X-Admin-Id': adminId } });
            const datosBrutos = response.data?.Data ?? response.data?.data ?? response.data ?? [];
            return Array.isArray(datosBrutos) ? datosBrutos.map(normalizarOrden) : [];
        } catch (error: any) {
            if (error.response?.status === 404) return [];
            throw manejarErrorHttp(error, "Fallo de conexión al cargar la lista de órdenes.");
        }
    },

    getById: async (id: number, adminId: number) => {
        if (AppConfig.usarMocks) return null;
        try {
            const response = await apiClient.get(`/ordenes/${id}`, { headers: { 'X-Admin-Id': adminId } });
            const resultado = response.data?.Data ?? response.data?.data ?? response.data.objeto ?? response.data;
            return normalizarOrden(resultado);
        } catch (error: any) {
            throw manejarErrorHttp(error, "Error al buscar los detalles de la orden.");
        }
    },

    getByFechas: async (inicio: Date, fin: Date, adminId: number) => {
        if (AppConfig.usarMocks) return [];
        try {
            const params = new URLSearchParams({ inicio: inicio.toISOString(), fin: fin.toISOString() });
            const response = await apiClient.get(`/ordenes/rango?${params.toString()}`, { headers: { 'X-Admin-Id': adminId } });
            const datosBrutos = response.data?.Data ?? response.data?.data ?? response.data ?? [];
            return Array.isArray(datosBrutos) ? datosBrutos.map(normalizarOrden) : [];
        } catch (error: any) {
            if (error.response?.status === 404) return [];
            throw manejarErrorHttp(error, "Fallo de conexión al filtrar órdenes.");
        }
    },

    getUnpaid: async (adminId: number) => {
        if (AppConfig.usarMocks) return [];
        try {
            const response = await apiClient.get(`/ordenes/unpaid/`, { headers: { 'X-Admin-Id': adminId } });
            const datosBrutos = response.data?.Data ?? response.data?.data ?? response.data ?? [];
            return Array.isArray(datosBrutos) ? datosBrutos.map(normalizarOrden) : [];
        } catch (error: any) {
            if (error.response?.status === 404) return [];
            throw manejarErrorHttp(error, "Fallo de conexión al filtrar órdenes no pagadas.");
        }
    },

    create: async (nuevaOrden: OrdenCreateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) return { success: true };
        try {
            const response = await apiClient.post('/ordenes', nuevaOrden, { headers: { 'X-Usuario-Id': usuarioId } });
            return response.data;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Ocurrió un error al procesar la orden.");
        }
    },

    anular: async (id: number, adminId: number) => {
        if (AppConfig.usarMocks) return { success: true };
        try {
            const response = await apiClient.patch(`/ordenes/${id}/anular`, {}, { headers: { 'X-Admin-Id': adminId } });
            return response.data;
        } catch (error: any) {
            throw manejarErrorHttp(error, "No se pudo anular la orden.");
        }
    }
};