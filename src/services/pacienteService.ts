import { apiClient, AppConfig } from '../config/ApiClient';
import type { PacienteCreateDTO, PacienteUpdateDTO } from '../types/DTOs/PacienteCreateDTO';

// Mocks adaptados al estándar camelCase
const pacientesMockData = [
    { id: 1, nombre: 'Charles John', apellido: 'Doe', cedula: 'V-15421054', sexo: 'M', telefono: '0414-1234567', direccion: 'Av. Principal' },
    { id: 2, nombre: 'Juan Perez', apellido: 'calzon', cedula: 'V-15421055', sexo: 'M', telefono: '0414-1234567', direccion: 'Av. Principal' },
    { id: 3, nombre: 'petra maria', apellido: 'pantaleta', cedula: 'V-15421056', sexo: 'F', telefono: '0414-1234567', direccion: 'Av. Principal' }
];

// Interceptor global de Errores 400
const manejarErrorHttp = (error: any, mensajePorDefecto: string) => {
    if (error.response?.status === 400 && error.response?.data?.errors) {
        const errores = error.response.data.errors;
        const campo = Object.keys(errores)[0];
        let mensajeValidacion = errores[campo][0];

        if (mensajeValidacion.includes("is required")) {
            mensajeValidacion = "Este campo es obligatorio.";
        } else if (mensajeValidacion.includes("maximum length")) {
            const match = mensajeValidacion.match(/maximum length of '(\d+)'/);
            const limite = match ? match[1] : "permitidos";
            mensajeValidacion = `No puede exceder los ${limite} caracteres.`;
        } else if (mensajeValidacion.includes("invalid") || mensajeValidacion.includes("not valid")) {
            mensajeValidacion = "El formato ingresado no es válido.";
        }

        throw new Error(`Error en '${campo}': ${mensajeValidacion}`);
    }

    const data = error.response?.data;
    const mensajeBackend = data?.Message ?? data?.message ?? data?.Mensaje ?? data?.mensaje;
    throw new Error(mensajeBackend || error.message || mensajePorDefecto);
};

export const pacienteService = {
    // --------------------------------------------------------
    // MÉTODOS GET (Sin requerir usuarioId)
    // --------------------------------------------------------
    
    getAll: async () => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(pacientesMockData), 500));
        }

        try {
            const response = await apiClient.get('/paciente');
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al obtener pacientes");
            
            return resultado.Data ?? resultado.data ?? resultado ?? [];
        } catch (error: any) {
            if (error.response?.status === 404) return []; 
            throw manejarErrorHttp(error, "Fallo de conexión con el servidor.");
        }
    },

    getById: async (id: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(pacientesMockData.find(p => p.id === id)), 500));
        }
        
        try {
            // CORRECCIÓN: URL apuntando al endpoint específico
            const response = await apiClient.get(`/paciente/${id}`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al obtener el paciente");
            
            return resultado.Data ?? resultado.data ?? resultado.objeto ?? resultado;
        } catch(error: any) {
            if (error.response?.status === 404) throw new Error("El paciente no existe en la base de datos.");
            throw manejarErrorHttp(error, "Fallo de conexión al buscar el paciente.");
        }
    },

    getByNombre: async (nombre: string) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(pacientesMockData.filter(p => p.nombre.toLowerCase().includes(nombre.toLowerCase()))), 500));
        }
        
        try {
            // CORRECCIÓN: URL apuntando al buscador de nombre
            const response = await apiClient.get(`/paciente/buscar/nombre/${nombre}`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al buscar pacientes");
            
            return resultado.Data ?? resultado.data ?? resultado ?? [];
        } catch(error: any) {
            if (error.response?.status === 404) return []; 
            throw manejarErrorHttp(error, "Error de red al buscar por nombre.");
        }
    },

    getByApellido: async (apellido: string) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(pacientesMockData.filter(p => p.apellido.toLowerCase().includes(apellido.toLowerCase()))), 500));
        }
        
        try {
            // CORRECCIÓN: URL apuntando al buscador de apellido
            const response = await apiClient.get(`/paciente/buscar/apellido/${apellido}`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al buscar pacientes");
            
            return resultado.Data ?? resultado.data ?? resultado ?? [];
        } catch(error: any) {
            if (error.response?.status === 404) return []; 
            throw manejarErrorHttp(error, "Error de red al buscar por apellido.");
        }
    },

    getByCedula: async (cedula: string) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(pacientesMockData.find(p => p.cedula === cedula)), 500));
        }
        
        try {
            // CORRECCIÓN: URL apuntando al buscador de cédula
            const response = await apiClient.get(`/paciente/buscar/cedula/${cedula}`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al obtener el paciente");
            
            return resultado.Data ?? resultado.data ?? resultado.objeto ?? resultado;
        } catch(error: any) {
            if (error.response?.status === 404) return null; // Retornamos null para manejar cedulas no registradas amigablemente
            throw manejarErrorHttp(error, "Fallo de conexión al buscar por cédula.");
        }
    },

    // --------------------------------------------------------
    // MÉTODOS POST Y PATCH (Operaciones con Auditoría Estricta)
    // --------------------------------------------------------

    create: async (paciente: PacienteCreateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.post('/paciente', paciente, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Ocurrió un error al registrar el paciente.");
        }
    },

    update: async (id: number, paciente: PacienteUpdateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }

        try {
            const response = await apiClient.patch(`/paciente/${id}/actualizar`, paciente, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Ocurrió un error al actualizar los datos del paciente.");
        }
    },

    deactivate: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }

        try {
            const response = await apiClient.patch(`/paciente/${id}/Desactivar`, {}, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;
            
            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Error al intentar desactivar el paciente.");
        }
    },

    activate: async (id: number, state: boolean, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }

        try {
            const response = await apiClient.patch(`/paciente/${id}/activar?State=${state}`, {}, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;
            
            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Error al intentar activar el paciente.");
        }
    }
};