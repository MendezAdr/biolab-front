import { apiClient, AppConfig } from '../config/ApiClient';
import type { RolCreateDTO, RolUpdateDTO, RolResponseDTO } from '../types/DTOs/RolDTOS';

// Mocks actualizados a camelCase estricto
const rolesMockData: RolResponseDTO[] = [
    { id: 1, rolName: 'Administrador Global', permisos: [511] },
    { id: 2, rolName: 'Bioanalista', permisos: [1, 16, 32, 256] },
    { id: 3, rolName: 'Cajero / Recepción', permisos: [1, 8, 16, 64, 256] }
];

// Interceptor de Errores HTTP
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

        throw new Error(`Error de formato en '${campo}': ${mensajeValidacion}`);
    }

    const data = error.response?.data;
    const mensajeBackend = data?.Message ?? data?.message ?? data?.Mensaje ?? data?.mensaje;
    throw new Error(mensajeBackend || error.message || mensajePorDefecto);
};

export const rolService = {
    
    getAll: async (): Promise<RolResponseDTO[]> => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(rolesMockData), 500));
        }
        
        try {
            const response = await apiClient.get('/roles');
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) {
                throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al obtener los roles.");
            }

            return resultado.Data ?? resultado.data ?? resultado ?? [];
        } catch (error: any) {
            if (error.response?.status === 404) return []; 
            throw manejarErrorHttp(error, "Fallo de conexión al cargar la lista de roles.");
        }
    },

    getById: async (id: number): Promise<RolResponseDTO> => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => 
                resolve(rolesMockData.find(r => r.id === id) as RolResponseDTO), 500));
        }
        
        try {
            const response = await apiClient.get(`/roles/${id}`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) {
                throw new Error(resultado.Message ?? resultado.mensaje ?? "Rol no encontrado.");
            }

            return resultado.Data ?? resultado.data ?? resultado.objeto ?? resultado;
        } catch (error: any) {
            if (error.response?.status === 404) throw new Error("El rol especificado no existe en la base de datos.");
            throw manejarErrorHttp(error, "Error al buscar el rol especificado.");
        }
    },

    create: async (rol: RolCreateDTO): Promise<RolResponseDTO> => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ id: 99, rolName: rol.nombre, permisos: rol.permisos } as RolResponseDTO), 500));
        }
        
        try {
            const response = await apiClient.post('/roles', rol);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) {
                throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al crear el rol.");
            }

            return resultado.Data ?? resultado.data ?? resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Ocurrió un error al registrar el nuevo rol.");
        }
    },

    update: async (id: number, rol: RolUpdateDTO): Promise<RolResponseDTO> => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ id: rol.id, rolName: rol.nombre, permisos: rol.permisos } as RolResponseDTO), 500));
        }
        
        try {
            const response = await apiClient.put(`/roles/${id}`, rol);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) {
                throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al actualizar el rol.");
            }

            return resultado.Data ?? resultado.data ?? resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Ocurrió un error al actualizar los privilegios del rol.");
        }
    },

    delete: async (id: number): Promise<boolean> => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(true), 500));
        }
        
        try {
            const response = await apiClient.delete(`/roles/${id}`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) {
                throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al eliminar el rol.");
            }

            return true;
        } catch (error: any) {
            throw manejarErrorHttp(error, "No se puede eliminar este rol. Verifica que no existan usuarios asignados a él.");
        }
    }
};