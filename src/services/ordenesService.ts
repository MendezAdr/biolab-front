import { apiClient } from '../config/ApiClient'; 
import type { OrdenCreateDTO } from '../types/DTOs/OrdenCreateDTO'; 
import type { OrdenUpdateDTO } from '../types/DTOs/OrdenUpdateDTO';
import { EstadoPago } from '../types/DTOs/EstadoPagoEnum'; 

export const ordenesService = {
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    

    // obtener todos los registros de ordenes
    getAll: async (adminId: number) => {
        // Se pasa el X-Admin-Id en el objeto de configuración de headers
        const response = await apiClient.get('/ordenes', {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },

    // RF-13: Obtener orden por ID con sus detalles y pagos
    // obtener por id
    getById: async (id: number, adminId: number) => {
        const response = await apiClient.get(`/ordenes/${id}`, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },

    // RF-13: Consultar histórico por rango de fechas
    // obtener por rango de fechas
    getByFechas: async (inicio: Date, fin: Date, adminId: number) => {
        // Convertimos las fechas a formato ISO para enviarlas por Query Params
        const queryParams = new URLSearchParams({
            inicio: inicio.toISOString(),
            fin: fin.toISOString()
        });
        
        const response = await apiClient.get(`/ordenes/rango?${queryParams.toString()}`, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },
    // obtener por paciente
    getByPaciente: async (pacienteId: number, adminId: number) => {
        const response = await apiClient.get(`/ordenes/paciente/${pacienteId}`, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },
    // RF-13: Consultar histórico por estado de pago
    // obtener por estado de pago
    getByEstado: async (estado: EstadoPago, adminId: number) => {
        // Nota: asumiendo que 'estado' es un número basado en tu enum EstadoPago[cite: 18]
        const response = await apiClient.get(`/ordenes/estado/${estado}`, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT, PATCH
    // --------------------------------------------------------

    // RF-15: Procesar una nueva venta/orden completa
    // crear una nueva orden
    create: async (nuevaOrden: OrdenCreateDTO, usuarioId: number) => {
        // Para POST, el segundo parámetro es el body (nuevaOrden), el tercero es la configuración[cite: 18]
        const response = await apiClient.post('/ordenes', nuevaOrden, {
            headers: { 'X-Usuario-Id': usuarioId } 
        });
        return response.data;
    },

    // RF-18: Anulación de ventas (Cambio de estado)
    // anular una orden existente
    anular: async (id: number, adminId: number) => {
        // En PATCH, si no hay body, enviamos un objeto vacío o null como segundo parámetro
        const response = await apiClient.patch(`/ordenes/${id}/anular`, {}, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },
    // actualizar una orden existente
    update: async (id: number, ordenActualizada: OrdenUpdateDTO, adminId: number) => {
        // Se envía el objeto OrdenUpdateDTO en el body
        const response = await apiClient.put(`/ordenes/${id}/actualizar`, ordenActualizada, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    }
};