import { apiClient, AppConfig } from '../config/ApiClient';
import type { ExamenCreateDTO } from '../types/DTOs/ExamenCreateDTO'; 
import type { ExamenUpdateDTO } from '../types/DTOs/ExamenUpdateDTO'; 

// Mocks adaptados al estándar camelCase
const examenesMockData = [
    { id: 1, nombreExamen: 'Hemograma Completo', descripcion: 'Análisis de sangre para evaluar la salud general.', costoEnDivisa: 25.00 },
    { id: 2, nombreExamen: 'Perfil Lipídico', descripcion: 'Mide los niveles de colesterol y triglicéridos.', costoEnDivisa: 30.00 },
    { id: 3, nombreExamen: 'Prueba de Glucosa', descripcion: 'Evalúa los niveles de azúcar en sangre.', costoEnDivisa: 15.00 }
];

// Interceptor global de Errores 400 (Validación de ASP.NET Core)
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
        }

        throw new Error(`Error en '${campo}': ${mensajeValidacion}`);
    }

    const data = error.response?.data;
    const mensajeBackend = data?.Message ?? data?.message ?? data?.Mensaje ?? data?.mensaje;
    throw new Error(mensajeBackend || error.message || mensajePorDefecto);
};

export const examenesService = {
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    
    getAll: async () => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(examenesMockData), 500));
        }

        try {
            const response = await apiClient.get('/examen');
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) {
                throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al obtener el catálogo de exámenes.");
            }

            return resultado.Data ?? resultado.data ?? resultado ?? [];
        } catch (error: any) {
            if (error.response?.status === 404) return [];
            throw manejarErrorHttp(error, "Fallo de conexión al cargar la lista de exámenes.");
        }
    },

    getById: async (id: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(examenesMockData.find(e => e.id === id)), 500));
        }
        
        try {
            const response = await apiClient.get(`/examen/${id}`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) {
                throw new Error(resultado.Message ?? resultado.mensaje ?? "Examen no encontrado.");
            }

            return resultado.Data ?? resultado.data ?? resultado.objeto ?? resultado;
        } catch (error: any) {
            if (error.response?.status === 404) throw new Error("El examen especificado no existe.");
            throw manejarErrorHttp(error, "Error al buscar el examen especificado.");
        }
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT, DELETE
    // --------------------------------------------------------

    create: async (nuevoExamen: ExamenCreateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.post('/examen', nuevoExamen, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Ocurrió un error al registrar el nuevo examen.");
        }
    },

    update: async (id: number, examenActualizado: ExamenUpdateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.put(`/examen/${id}`, examenActualizado, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Ocurrió un error al actualizar los datos del examen.");
        }
    },

    delete: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.delete(`/examen/${id}`, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "No se pudo eliminar el examen. Verifique si tiene detalles u órdenes asociadas.");
        }
    }
};