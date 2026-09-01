import { apiClient } from '../config/ApiClient';
import type { PacienteCreateDTO } from '../types/DTOs/PacienteCreateDTO';
import type { PacienteUpdateDTO } from '../types/DTOs/PacienteUpdateDTO';

export const pacienteService = {
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    
    getAll: async () => {
        const response = await apiClient.get('/paciente');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get(`/paciente/${id}`);
        return response.data;
    },

    getByNombre: async (nombre: string) => {
        const response = await apiClient.get(`/paciente/buscar/nombre/${nombre}`);
        return response.data;
    },

    getByApellido: async (apellido: string) => {
        const response = await apiClient.get(`/paciente/buscar/apellido/${apellido}`);
        return response.data;
    },

    getByCedula: async (cedula: string) => {
        const response = await apiClient.get(`/paciente/buscar/cedula/${cedula}`);
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS POST Y PATCH
    // --------------------------------------------------------

    create: async (paciente: PacienteCreateDTO, usuarioId: number) => {
        const response = await apiClient.post('/paciente', paciente, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    update: async (id: number, paciente: PacienteUpdateDTO, usuarioId: number) => {
        // Nota: usamos .patch porque tu controlador usa [HttpPatch("{id}/actualizar")]
        const response = await apiClient.patch(`/paciente/${id}/actualizar`, paciente, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    deactivate: async (id: number, usuarioId: number) => {
        const response = await apiClient.patch(`/paciente/${id}/Desactivar`, {}, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    },

    activate: async (id: number, state: boolean, usuarioId: number) => {
        // Pasamos el booleano 'state' como query parameter (?State=true/false)
        const response = await apiClient.patch(`/paciente/${id}/activar?State=${state}`, {}, {
            headers: { 'X-Usuario-Id': usuarioId }
        });
        return response.data;
    }
};