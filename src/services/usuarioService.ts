import { apiClient, AppConfig } from '../config/ApiClient';
import type { UsuarioCreateDTO } from '../types/DTOs/UsuarioCreateDTO'; 
import type { UsuarioUpdateDTO } from '../types/DTOs/UsuarioUpdateDTO';

const usuariosMockData = [
    {
        id: 1,
        username: 'Admin',
        nombre: 'Admin',
        apellido: 'User',
        cedula: 'V-12345678',
        contrasena: 'admin123',
        rolId: 1,
        permisos: [0, 511],
        isActive: true
    },
    {   
        id: 2,
        username: 'Doctor1',
        nombre: 'John',
        apellido: 'Doe',
        cedula: 'V-87654321',
        contrasena: 'doctor123',
        rolId: 2,
        permisos: [1, 2, 4],
        isActive: true
    },
    {   
        id: 3,
        username: 'LabTech1',
        nombre: 'Jane',
        apellido: 'Smith',
        cedula: 'V-11223344',
        contrasena: 'labtech123',
        rolId: 3,
        permisos: [1, 8, 16],
        isActive: false
    }
];

// Interceptor de Errores 400 (Validación Automática de ASP.NET Core)
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

export const usuariosService = {
    
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    
    getAll: async (usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(usuariosMockData), 500));
        }
        
        try {
            const response = await apiClient.get('/usuarios', {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al obtener usuarios.");
            return resultado.Data ?? resultado.data ?? resultado ?? [];
            
        } catch (error: any) {
            if (error.response && error.response.status === 404) return []; 
            throw manejarErrorHttp(error, "Fallo de conexión al cargar la lista de usuarios.");
        }
    },

    getById: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(usuariosMockData.find(u => u.id === id)), 500));
        }

        try {
            const response = await apiClient.get(`/usuarios/${id}`, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Usuario no encontrado.");
            return resultado.Data ?? resultado.data ?? resultado.objeto ?? resultado; 
            
        } catch (error: any) {
            if (error.response && error.response.status === 404) return null;
            throw manejarErrorHttp(error, "Error al buscar el usuario especificado.");
        }
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT
    // --------------------------------------------------------

    create: async (nuevoUsuario: UsuarioCreateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.post('/usuarios', nuevoUsuario, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Ocurrió un error al registrar el usuario.");
        }
    },

    updateUser: async (id: number, usuarioActualizado: UsuarioUpdateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }

        try {
            const response = await apiClient.put(`/usuarios/${id}`, usuarioActualizado, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Error al actualizar la ficha del usuario.");
        }
    },

    // --------------------------------------------------------
    // MÉTODOS PATCH
    // --------------------------------------------------------

    deactivate: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.patch(`/usuarios/${id}/desactivar`, {}, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Error al intentar desactivar la cuenta.");
        }
    },

    activate: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.patch(`/usuarios/${id}/activar`, {}, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Error al intentar reactivar la cuenta.");
        }
    },

    resetPassword: async (id: number, newPassword: string, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.patch(
                `/usuarios/${id}/reset-password`,
                JSON.stringify(newPassword), 
                {
                    headers: { 
                        'X-Usuario-Id': usuarioId,
                        'Content-Type': 'application/json' 
                    }
                }
            );
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje);
            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Fallo al restablecer las credenciales de seguridad.");
        }
    },

    // --------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------

    login: async (credenciales: { username: string; contrasena: string }) => {
        if (AppConfig.usarMocks) {
            return new Promise<any>((resolve, reject) => {
                setTimeout(() => {
                    if (credenciales.username.toLowerCase() === 'admin' && credenciales.contrasena === 'admin123') {
                        resolve({
                            exito: true,
                            mensaje: "Autenticación exitosa",
                            usuarioInfo: {
                                id: 1,
                                username: 'admin',
                                nombre: 'Adrián',
                                apellido: 'Méndez',
                                rolNombre: 'Administrador Global',
                                permisos: [0, 511] 
                            },
                            tasaDolar: 36.50
                        });
                    } else {
                        reject(new Error("Usuario o contraseña incorrectos. (Usa admin / admin123 en modo mock)"));
                    }
                }, 800);
            });
        }
        
        try {
            // El backend C# espera { Username, Password }[cite: 29]. 
            // Axios y C# manejan el camelCase automáticamente en la serialización.
            const response = await apiClient.post('/usuarios/login', {
                username: credenciales.username,
                password: credenciales.contrasena
            });
            
            const resultado = response.data;
            const exito = resultado.Exito ?? resultado.exito ?? resultado.Success ?? resultado.success;

            if (exito === false) {
                throw new Error(resultado.Mensaje ?? resultado.mensaje ?? resultado.Message ?? "Credenciales inválidas.");
            }

            const infoBackend = resultado.UsuarioInfo ?? resultado.usuarioInfo ?? resultado.Data ?? resultado.data ?? {};
            
            const permisosBackend = infoBackend.permisosSistema ?? infoBackend.PermisosSistema ?? 
                                    infoBackend.permisos ?? infoBackend.Permisos ?? 
                                    infoBackend.Rol?.Permisos ?? infoBackend.rol?.permisos;

            const usuarioFormateado = {
                id: infoBackend.Id ?? infoBackend.id,
                username: infoBackend.Username ?? infoBackend.username,
                nombre: infoBackend.Nombre ?? infoBackend.nombre,
                apellido: infoBackend.Apellido ?? infoBackend.apellido,
                rolNombre: infoBackend.RolName ?? infoBackend.rolName ?? infoBackend.Rol?.RolName ?? 'Sin Rol',
                permisos: permisosBackend ?? []
            };

            return {
                ...resultado,
                UsuarioInfo: usuarioFormateado 
            };

        } catch (error: any) {
            throw manejarErrorHttp(error, "Fallo de conexión en el inicio de sesión. Verifica tus credenciales.");
        }
    }
};