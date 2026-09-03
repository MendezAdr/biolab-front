import { apiClient, AppConfig } from '../config/ApiClient';
import type { ExamenCreateDTO } from '../types/DTOs/ExamenCreateDTO'; 
import type { ExamenUpdateDTO } from '../types/DTOs/ExamenUpdateDTO'; 

const examenesMockData = [
    {
        Id: 1,
        NombreExamen: 'Hemograma Completo',
        Descripcion: 'Análisis de sangre para evaluar la salud general.',
        CostoEnDivisa: 25.00
    },
    {
        Id: 2,
        NombreExamen: 'Perfil Lipídico',
        Descripcion: 'Mide los niveles de colesterol y triglicéridos.',
        CostoEnDivisa: 30.00
    },
    {
        Id: 3,
        NombreExamen: 'Prueba de Glucosa',
        Descripcion: 'Evalúa los niveles de azúcar en sangre.',
        CostoEnDivisa: 15.00
    }
];

export const examenesService = {
    // --------------------------------------------------------
    // MÉTODOS GET (Sin requerir usuarioId en el controlador actual)
    // --------------------------------------------------------
    
    getAll: async () => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo examenes simulados");
            return new Promise((resolve) => {
                setTimeout(() => resolve(examenesMockData), 500);
            });
        }

        const response = await apiClient.get('/examen');
        return response.data;
    },

    getById: async (id: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo examen simulado por ID", id);
            return new Promise((resolve) => {
                setTimeout(() => resolve(examenesMockData.find(e => e.Id === id)), 500);
            });
        }
        const response = await apiClient.get(`/examen/${id}`);
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT, DELETE (Operaciones críticas)
    // --------------------------------------------------------

    create: async (nuevoExamen: ExamenCreateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando creación de examen", nuevoExamen);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        const response = await apiClient.post('/examen', nuevoExamen, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    update: async (id: number, examenActualizado: ExamenUpdateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando actualización de examen", examenActualizado);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        const response = await apiClient.put(`/examen/${id}`, examenActualizado, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    delete: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando eliminación de examen", id);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        // Axios permite enviar headers en peticiones DELETE usando la propiedad config
        const response = await apiClient.delete(`/examen/${id}`, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    }
};