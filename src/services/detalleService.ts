import { apiClient, AppConfig } from '../config/ApiClient';
import type { DetalleCreateDTO } from '../types/DTOs/DetalleCreateDTO';
import type { DetalleUpdateDTO } from '../types/DTOs/DetalleUpdateDTO';

const detalleMockData = [
    {
        Id: 1,
        OrdenId: 101,
        ExamenId: 1,
        PrecioMomentoDivisa: 25.00
    },
    {
        Id: 2,
        OrdenId: 101,
        ExamenId: 2,
        PrecioMomentoDivisa: 30.00
    },
    {
        Id: 3,
        OrdenId: 102,
        ExamenId: 3,
        PrecioMomentoDivisa: 15.00
    }
];

export const detalleService = {
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    
    getByOrdenId: async (id: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo detalles simulados por OrdenId", id);
            return new Promise((resolve) => {
                setTimeout(() => resolve(detalleMockData.filter(d => d.OrdenId === id)), 500);
            });
        }
        const response = await apiClient.get(`/detalle/${id}`);
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT
    // --------------------------------------------------------

    create: async (detalle: DetalleCreateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando creación de detalle", detalle);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        // Enviamos el DetalleCreateDTO en el body[cite: 37]
        const response = await apiClient.post('/detalle', detalle, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    update: async (id: number, detalle: DetalleUpdateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando actualización de detalle", detalle);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        // Enviamos el DetalleUpdateDTO en el body[cite: 38]
        const response = await apiClient.put(`/detalle/${id}`, detalle, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    }
};