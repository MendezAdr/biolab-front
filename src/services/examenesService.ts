import { apiClient } from '../config/ApiClient';
import type { ExamenCreateDTO } from '../types/DTOs/ExamenCreateDTO'; 
import type { ExamenUpdateDTO } from '../types/DTOs/ExamenUpdateDTO'; 

export const examenesService = {
    // --------------------------------------------------------
    // MÉTODOS GET (Sin requerir usuarioId en el controlador actual)
    // --------------------------------------------------------
    
    getAll: async () => {
        const response = await apiClient.get('/examen');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get(`/examen/${id}`);
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT, DELETE (Operaciones críticas)
    // --------------------------------------------------------

    create: async (nuevoExamen: ExamenCreateDTO, usuarioId: number) => {
        const response = await apiClient.post('/examen', nuevoExamen, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    update: async (id: number, examenActualizado: ExamenUpdateDTO, usuarioId: number) => {
        const response = await apiClient.put(`/examen/${id}`, examenActualizado, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    delete: async (id: number, usuarioId: number) => {
        // Axios permite enviar headers en peticiones DELETE usando la propiedad config
        const response = await apiClient.delete(`/examen/${id}`, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    }
};