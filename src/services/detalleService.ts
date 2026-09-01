import { apiClient } from '../config/ApiClient';
import type { DetalleCreateDTO } from '../types/DTOs/DetalleCreateDTO';
import type { DetalleUpdateDTO } from '../types/DTOs/DetalleUpdateDTO';

export const detalleService = {
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    
    getByOrdenId: async (id: number) => {
        const response = await apiClient.get(`/detalle/${id}`);
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT
    // --------------------------------------------------------

    create: async (detalle: DetalleCreateDTO, usuarioId: number) => {
        // Enviamos el DetalleCreateDTO en el body[cite: 37]
        const response = await apiClient.post('/detalle', detalle, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    update: async (id: number, detalle: DetalleUpdateDTO, usuarioId: number) => {
        // Enviamos el DetalleUpdateDTO en el body[cite: 38]
        const response = await apiClient.put(`/detalle/${id}`, detalle, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    }
};