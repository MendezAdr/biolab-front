import { apiClient } from '../config/ApiClient';
import { AppConfig } from '../config/ApiClient';
import type { PacienteCreateDTO } from '../types/DTOs/PacienteCreateDTO';
import type { PacienteUpdateDTO } from '../types/DTOs/PacienteUpdateDTO';


const pacientesMockData = [
    {
        Id: 1,
        Nombre: 'Charles John',
        Apellido: 'Doe',
        Cedula: 'V-15421054',
        Sexo: 'M',
        Telefono: '0414-1234567',
        Direccion: 'Av. Principal'
    },
    {
        Id: 2,
        Nombre: 'JUan Perez',
        Apellido: 'calzon',
        Cedula: 'V-15421054',
        Sexo: 'M',
        Telefono: '0414-1234567',
        Direccion: 'Av. Principal'
    },
    {
        Id: 3,
        Nombre: 'petra maria',
        Apellido: 'pantaleta',
        Cedula: 'V-15421054',
        Sexo: 'M',
        Telefono: '0414-1234567',
        Direccion: 'Av. Principal'
    }
    // ... agrega un par más
];

export const pacienteService = {
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    
    getAll: async () => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo pacientes simulados");
            return new Promise((resolve) => {
                setTimeout(() => resolve(pacientesMockData), 500); // Simulamos latencia
            });
        }

        const response = await apiClient.get('/paciente');
        return response.data;
    },

    getById: async (id: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo paciente simulado");
            return new Promise((resolve) => {
                setTimeout(() => {
                    const paciente = pacientesMockData.find(p => p.Id === id);
                    resolve(paciente);
                }, 500);
            });
        }

        const response = await apiClient.get(`/paciente/${id}`);
        return response.data;
    },

    getByNombre: async (nombre: string) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo paciente simulado");
            return new Promise((resolve) => {
                setTimeout(() => {
                    const paciente = pacientesMockData.find(p => p.Nombre  === nombre);
                    resolve(paciente);
                }, 500);
            });
        }

        const response = await apiClient.get(`/paciente/buscar/nombre/${nombre}`);
        return response.data;
    },

    getByApellido: async (apellido: string) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo paciente simulado");
            return new Promise((resolve) => {
                setTimeout(() => {
                    const paciente = pacientesMockData.find(p => p.Apellido === apellido);
                    resolve(paciente);
                }, 500);
            });
        }

        const response = await apiClient.get(`/paciente/buscar/apellido/${apellido}`);
        return response.data;
    },

    getByCedula: async (cedula: string) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo paciente simulado");
            return new Promise((resolve) => {
                setTimeout(() => {
                    const paciente = pacientesMockData.find(p => p.Cedula === cedula);
                    resolve(paciente);
                }, 500);
            });
        }

        const response = await apiClient.get(`/paciente/buscar/cedula/${cedula}`);
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS POST Y PATCH
    // --------------------------------------------------------

    create: async (paciente: PacienteCreateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando creación de paciente", paciente);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        const response = await apiClient.post('/paciente', paciente, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    update: async (id: number, paciente: PacienteUpdateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando actualización de paciente", paciente);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }

        // Nota: usamos .patch porque tu controlador usa [HttpPatch("{id}/actualizar")]
        const response = await apiClient.patch(`/paciente/${id}/actualizar`, paciente, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    deactivate: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando desactivación de paciente");
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }

        const response = await apiClient.patch(`/paciente/${id}/Desactivar`, {}, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    activate: async (id: number, state: boolean, usuarioId: number) => {
        // Pasamos el booleano 'state' como query parameter (?State=true/false)
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando activación de paciente");
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }

        const response = await apiClient.patch(`/paciente/${id}/activar?State=${state}`, {}, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    }
};