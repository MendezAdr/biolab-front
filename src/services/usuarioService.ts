import { apiClient } from '../config/ApiClient';
import type { UsuarioCreateDTO } from '../types/DTOs/UsuarioCreateDTO'; // Ajusta la ruta a tu estructura
import type { UsuarioUpdateDTO } from '../types/DTOs/UsuarioUpdateDTO';

export const usuariosService = {
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    
    // RF-3: Obtener lista para el Administrador
    getAll: async (usuarioId: number) => {
        const response = await apiClient.get('/usuarios', {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    getById: async (id: number, usuarioId: number) => {
        const response = await apiClient.get(`/usuarios/${id}`, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT
    // --------------------------------------------------------

    // RF-3: Registro de Usuarios[cite: 27]
    create: async (nuevoUsuario: UsuarioCreateDTO, usuarioId: number) => {
        const response = await apiClient.post('/usuarios', nuevoUsuario, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    updateUser: async (id: number, usuarioActualizado: UsuarioUpdateDTO, usuarioId: number) => {
        const response = await apiClient.put(`/usuarios/${id}`, usuarioActualizado, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS PATCH
    // --------------------------------------------------------

    // RF-3: Desactivar cuentas (Baja de usuarios)[cite: 27]
    deactivate: async (id: number, usuarioId: number) => {
        // Axios espera (url, data, config) en métodos PATCH y POST. 
        // Pasamos un objeto vacío {} como "data" para que las cabeceras se lean correctamente en el "config".
        const response = await apiClient.patch(`/usuarios/${id}/desactivar`, {}, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    activate: async (id: number, usuarioId: number) => {
        const response = await apiClient.patch(`/usuarios/${id}/activar`, {}, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    // RF-5: Restablecimiento de Credenciales[cite: 27]
    resetPassword: async (id: number, newPassword: string, usuarioId: number) => {
        const response = await apiClient.patch(
            `/usuarios/${id}/reset-password`,
            JSON.stringify(newPassword), // Convertimos el string a formato JSON para C#
            {
                headers: { 
                    'X-Usuario-Id': usuarioId,
                    'Content-Type': 'application/json' 
                }
            }
        );
        return response.data;
    }
};