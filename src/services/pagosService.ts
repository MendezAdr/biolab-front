import { apiClient } from '../config/ApiClient';
import type { PagoUpdateDTO } from '../types/DTOs/PagoUpdateDTO'; // Importado según tu estructura[cite: 32]
import type { PagoStandaloneCreateDTO } from '../types/DTOs/PagoStandaloneCreateDTO'; 

export const pagosService = {
    // --------------------------------------------------------
    // MÉTODOS GET (Públicos / Sin auditoría estricta)
    // --------------------------------------------------------
    
    getById: async (id: number) => {
        const response = await apiClient.get(`/pagos/${id}`);
        return response.data;
    },

    getByMetodo: async (idMetodo: number) => {
        const response = await apiClient.get(`/pagos/metodo/${idMetodo}`);
        return response.data;
    },

    getByOrden: async (ordenId: number) => {
        const response = await apiClient.get(`/pagos/orden/${ordenId}`);
        return response.data;
    },

    getByReferencia: async (referenciaId: string) => {
        const response = await apiClient.get(`/pagos/referencia/${referenciaId}`);
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS GET CON QUERY PARAMS
    // --------------------------------------------------------
    getByFechas: async (fechaInicio?: Date, fechaFin?: Date) => {
        const queryParams = new URLSearchParams();
        
        // Añadimos los parámetros condicionalmente si existen
        if (fechaInicio) queryParams.append('fechaInicio', fechaInicio.toISOString());
        if (fechaFin) queryParams.append('fechaFin', fechaFin.toISOString());
        
        const response = await apiClient.get(`/pagos/fechas?${queryParams.toString()}`);
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT, DELETE (Operaciones críticas)
    // --------------------------------------------------------

    createAddPago: async (pago: PagoStandaloneCreateDTO, usuarioId: number) => {
        const response = await apiClient.post('/pagos', pago, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    update: async (id: number, pagoActualizado: PagoUpdateDTO, usuarioId: number) => {
        // Se envía el PagoUpdateDTO en el body[cite: 32, 33]
        const response = await apiClient.put(`/pagos/${id}`, pagoActualizado, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    delete: async (id: number, usuarioId: number) => {
        const response = await apiClient.delete(`/pagos/${id}`, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    }
};