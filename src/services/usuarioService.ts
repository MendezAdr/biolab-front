import { apiClient } from '../config/ApiClient';
import {AppConfig} from '../config/ApiClient';
import type { UsuarioCreateDTO } from '../types/DTOs/UsuarioCreateDTO'; // Ajusta la ruta a tu estructura
import type { UsuarioUpdateDTO } from '../types/DTOs/UsuarioUpdateDTO';


const usuariosMockData  = [
    {
        Id: 1,
        Username: 'Admin',
        Nombre: 'Admin',
        Apellido: 'User',
        Cedula: 'V-12345678',
        Contrasena: 'admin123',
        RolId: 1
    },
    {   
        Id: 2,
        Username: 'Doctor1',
        Nombre: 'John',
        Apellido: 'Doe',
        Cedula: 'V-87654321',
        Contrasena: 'doctor123',
        RolId: 2
    },
    {   
        Id: 3,
        Username: 'LabTech1',
        Nombre: 'Jane',
        Apellido: 'Smith',
        Cedula: 'V-11223344',
        Contrasena: 'labtech123',
        RolId: 3
    }
];


export const usuariosService = {
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    
    // RF-3: Obtener lista para el Administrador
    getAll: async (usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo usuarios simulados");
            return new Promise((resolve) => {
                setTimeout(() => resolve(usuariosMockData), 500); // Simulamos latencia
            });
        }
        
        const response = await apiClient.get('/usuarios', {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    getById: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo usuario simulado");
            return new Promise((resolve) => {
                setTimeout(() => resolve(usuariosMockData.find(u => u.Id === id)), 500);
            });
        }
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
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando creación de usuario", nuevoUsuario);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        const response = await apiClient.post('/usuarios', nuevoUsuario, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    updateUser: async (id: number, usuarioActualizado: UsuarioUpdateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando actualización de usuario", usuarioActualizado);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }

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
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando desactivación de usuario", id);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        // Axios espera (url, data, config) en métodos PATCH y POST. 
        // Pasamos un objeto vacío {} como "data" para que las cabeceras se lean correctamente en el "config".
        const response = await apiClient.patch(`/usuarios/${id}/desactivar`, {}, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    activate: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando activación de usuario", id);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        const response = await apiClient.patch(`/usuarios/${id}/activar`, {}, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    // RF-5: Restablecimiento de Credenciales[cite: 27]
    resetPassword: async (id: number, newPassword: string, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando restablecimiento de contraseña", id);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
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