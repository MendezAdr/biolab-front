import { apiClient } from '../config/ApiClient';
import type { Rol } from '../types/DTOs/RolUsuarioEnum';

export const rolService = {
    getAll: async (): Promise<Rol[]> => {
        // TODO: Descomentar esto cuando tu backend esté listo
        // const response = await apiClient.get('/roles');
        // return response.data;

        // Mock de datos simulando la respuesta de SQLite
        return [
            { Id: 1, Name: 'Administrador', Permisos: [] },
            { Id: 2, Name: 'Bioanalista', Permisos: [] },
            { Id: 3, Name: 'Secretaria', Permisos: [] },
            { Id: 4, Name: 'Auditor Externo', Permisos: [] }
        ];
    }
};