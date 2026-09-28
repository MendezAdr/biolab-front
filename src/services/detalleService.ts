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
        
        try {
            const response = await apiClient.get(`/detalle/${id}`);
            const resultado = response.data;

            if (resultado.Success === false || resultado.exito === false) {
                throw new Error(resultado.Message || resultado.mensaje || "Error al obtener los detalles de la orden.");
            }

            return resultado.Data || resultado.data || [];
        } catch (error: any) {
            // Protección contra listas vacías (404 Not Found)
            if (error.response && error.response.status === 404) {
                return []; 
            }
            const mensajeBackend = error.response?.data?.Message || error.response?.data?.mensaje;
            throw new Error(mensajeBackend || "Fallo de conexión al cargar los exámenes de esta orden.");
        }
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT
    // --------------------------------------------------------

    create: async (detalle: DetalleCreateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando creación de detalle", detalle);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.post('/detalle', detalle, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;

            if (resultado.Success === false || resultado.exito === false) {
                throw new Error(resultado.Message || resultado.mensaje || "Error al registrar el detalle.");
            }

            return resultado;
        } catch (error: any) {
            const mensajeBackend = error.response?.data?.Message || error.response?.data?.mensaje;
            throw new Error(mensajeBackend || "Ocurrió un error al añadir el examen a la orden.");
        }
    },

    update: async (id: number, detalle: DetalleUpdateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando actualización de detalle", detalle);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.put(`/detalle/${id}`, detalle, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;

            if (resultado.Success === false || resultado.exito === false) {
                throw new Error(resultado.Message || resultado.mensaje || "Error al actualizar el detalle.");
            }

            return resultado;
        } catch (error: any) {
            const mensajeBackend = error.response?.data?.Message || error.response?.data?.mensaje;
            throw new Error(mensajeBackend || "Ocurrió un error al modificar el examen en la orden.");
        }
    }
};