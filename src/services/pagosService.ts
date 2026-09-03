import { apiClient } from '../config/ApiClient';
import { AppConfig } from '../config/ApiClient';
import type { PagoUpdateDTO } from '../types/DTOs/PagoUpdateDTO'; // Importado según tu estructura[cite: 32]
import type { PagoStandaloneCreateDTO } from '../types/DTOs/PagoStandaloneCreateDTO'; 

const pagosMockData = [

    {
        Id: 1,
        OrdenId: 101,
        Monto: 50.00,
        Metodo: 1,
        Referencia: 'ABC123XYZ'
    },
    {
        Id: 2,
        OrdenId: 102,
        Monto: 75.00,
        Metodo: 2,
        Referencia: 'DEF456UVW'

    }, 
    {
        Id: 3,
        OrdenId: 103,
        Monto: 100.00,
        Metodo: 3,
        Referencia: 'GHI789RST'
    }
]

export const pagosService = {
    // --------------------------------------------------------
    // MÉTODOS GET (Públicos / Sin auditoría estricta)
    // --------------------------------------------------------
    
    getById: async (id: number) => {
        if (AppConfig.usarMocks) {
            console.log("🔧 MOCK: Obteniendo pago simulado");
            return new Promise((resolve) => {
                setTimeout(() => resolve(pagosMockData.find(p => p.Id === id)), 500);
            });
        }

        const response = await apiClient.get(`/pagos/${id}`);
        return response.data;
    },

    getByMetodo: async (idMetodo: number) => {
        if (AppConfig.usarMocks) {
            console.log("🔧 MOCK: Obteniendo pagos simulados por método");
            return new Promise((resolve) => {
                setTimeout(() => resolve(pagosMockData.filter(p => p.Metodo === idMetodo)), 500);
            });
        }

        const response = await apiClient.get(`/pagos/metodo/${idMetodo}`);
        return response.data;
    },

    getByOrden: async (ordenId: number) => {
        if (AppConfig.usarMocks) {
            console.log("🔧 MOCK: Obteniendo pagos simulados por orden");
            return new Promise((resolve) => {
                setTimeout(() => resolve(pagosMockData.filter(p => p.OrdenId === ordenId)), 500);
            });
        }

        const response = await apiClient.get(`/pagos/orden/${ordenId}`);
        return response.data;
    },

    getByReferencia: async (referenciaId: string) => {
        if (AppConfig.usarMocks) {
            console.log("🔧 MOCK: Obteniendo pago simulado por referencia");
            return new Promise((resolve) => {
                setTimeout(() => resolve(pagosMockData.find(p => p.Referencia === referenciaId)), 500);
            });
        }

        const response = await apiClient.get(`/pagos/referencia/${referenciaId}`);
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS GET CON QUERY PARAMS
    // --------------------------------------------------------
    getByFechas: async (fechaInicio?: Date, fechaFin?: Date) => {
        const queryParams = new URLSearchParams();
        if (AppConfig.usarMocks){
            console.log("🔧 MOCK: Obteniendo pagos simulados por fechas");
            return new Promise((resolve) => {setTimeout(() => resolve(pagosMockData), 500);});
        }
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
        if(AppConfig.usarMocks) { 
            console.log("🔧 MOCK: Simulando creación de pago", pago);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        const response = await apiClient.post('/pagos', pago, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    update: async (id: number, pagoActualizado: PagoUpdateDTO, usuarioId: number) => {
        // Se envía el PagoUpdateDTO en el body[cite: 32, 33]
        if(AppConfig.usarMocks) {
            console.log("🔧 MOCK: Simulando actualización de pago", pagoActualizado);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true, data : pagoActualizado }), 500));
        }
        const response = await apiClient.put(`/pagos/${id}`, pagoActualizado, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    delete: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.log("🔧 MOCK: Simulando eliminación de pago", id);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        const response = await apiClient.delete(`/pagos/${id}`, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    }
};