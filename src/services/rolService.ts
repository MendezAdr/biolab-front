import { apiClient } from '../config/ApiClient';
import { AppConfig } from '../config/ApiClient';
import type { RolCreateDTO, RolUpdateDTO, RolResponseDTO } from '../types/DTOs/RolDTOS';

// Mocks iniciales para poder diseñar la UI
const rolesMockData: RolResponseDTO[] = [
    { Id: 1, RolName: 'Administrador Global', Permisos: [0] },
    { Id: 2, RolName: 'Bioanalista', Permisos: [1, 16, 32, 256] },
    { Id: 3, RolName: 'Cajero / Recepción', Permisos: [1, 8, 16, 64, 256] }
];

export const rolService = {
    getAll: async (): Promise<RolResponseDTO[]> => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo roles simulados");
            return new Promise((resolve) => setTimeout(() => resolve(rolesMockData), 500));
        }
        const response = await apiClient.get('/roles');
        return response.data;
    },

    getById: async (id: number): Promise<RolResponseDTO> => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => 
                resolve(rolesMockData.find(r => r.Id === id) as RolResponseDTO), 500));
        }
        const response = await apiClient.get(`/roles/${id}`);
        return response.data;
    },

    create: async (rol: RolCreateDTO): Promise<RolResponseDTO> => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando creación de rol", rol);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true } as any), 500));
        }
        const response = await apiClient.post('/roles', rol);
        return response.data;
    },

    update: async (id: number, rol: RolUpdateDTO): Promise<RolResponseDTO> => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando actualización de rol", rol);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true } as any), 500));
        }
        const response = await apiClient.put(`/roles/${id}`, rol);
        return response.data;
    },

    delete: async (id: number): Promise<boolean> => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando eliminación de rol", id);
            return new Promise((resolve) => setTimeout(() => resolve(true), 500));
        }
        const response = await apiClient.delete(`/roles/${id}`);
        return response.data;
    }
};