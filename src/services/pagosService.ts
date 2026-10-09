import { apiClient, AppConfig } from '../config/ApiClient';
import type { PagoUpdateDTO } from '../types/DTOs/PagoUpdateDTO'; 
import type { PagoStandaloneCreateDTO } from '../types/DTOs/PagoStandaloneCreateDTO'; 

const pagosMockData = [
    { id: 1, ordenId: 101, monto: 50.00, metodo: 1, referencia: 'ABC123XYZ', creadoPorId: 1, fechaCreacion: '2026-08-10' },
    { id: 2, ordenId: 102, monto: 75.00, metodo: 2, referencia: 'DEF456UVW', creadoPorId: 1, fechaCreacion: '2026-08-10' }, 
    { id: 3, ordenId: 103, monto: 100.00, metodo: 3, referencia: 'GHI789RST', creadoPorId: 1, fechaCreacion: '2026-08-10' }
];

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

// Función para normalizar los datos de auditoría al formato que usa el componente AuditoriaFooter (camelCase estricto)
const normalizarPago = (p: any) => ({
    ...p,
    id: p.id ?? p.Id,
    ordenId: p.ordenId ?? p.OrdenId,
    monto: p.monto ?? p.Monto,
    metodo: p.metodo ?? p.Metodo,
    referencia: p.referencia ?? p.Referencia,
    // Estandarización obligatoria para auditoría
    creadoPorId: p.creadoPorId ?? p.CreadoPorId,
    fechaCreacion: p.fechaCreacion ?? p.FechaCreacion,
    modificadoPorId: p.modificadoPorId ?? p.ModificadoPorId,
    fechaModificacion: p.fechaModificacion ?? p.FechaModificacion
});

export const pagosService = {
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    getAll: async () => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(pagosMockData.map(normalizarPago)), 500));
        }

        try {
            const response = await apiClient.get(`/pagos`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) {
                throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al obtener historial de pagos.");
            }

            const datosBrutos = resultado.Data ?? resultado.data ?? [];
            return Array.isArray(datosBrutos) ? datosBrutos.map(normalizarPago) : [];
        } catch (error: any) {
            if (error.response?.status === 404) return []; 
            throw manejarErrorHttp(error, "Fallo de conexión al cargar los pagos.");
        }
    },
    
    getById: async (id: number) => {
        if (AppConfig.usarMocks) {
            const pago = pagosMockData.find(p => p.id === id);
            return new Promise((resolve) => setTimeout(() => resolve(pago ? normalizarPago(pago) : null), 500));
        }

        try {
            const response = await apiClient.get(`/pagos/${id}`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) {
                throw new Error(resultado.Message ?? resultado.mensaje ?? "Pago no encontrado.");
            }

            const data = resultado.Data ?? resultado.data ?? resultado.objeto ?? resultado;
            return normalizarPago(data);
        } catch (error: any) {
            if (error.response?.status === 404) throw new Error("El detalle del pago especificado no existe.");
            throw manejarErrorHttp(error, "Error al buscar el detalle del pago.");
        }
    },

    getByMetodo: async (idMetodo: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve(pagosMockData.filter(p => p.metodo === idMetodo).map(normalizarPago)), 500));
        }

        try {
            const response = await apiClient.get(`/pagos/metodo/${idMetodo}`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al obtener pagos.");

            const datosBrutos = resultado.Data ?? resultado.data ?? [];
            return Array.isArray(datosBrutos) ? datosBrutos.map(normalizarPago) : [];
        } catch (error: any) {
            if (error.response?.status === 404) return []; 
            throw manejarErrorHttp(error, "Fallo de conexión al cargar los pagos por este método.");
        }
    },

    getByFechas: async (fechaInicio?: Date, fechaFin?: Date) => {
        if (AppConfig.usarMocks){
            return new Promise((resolve) => setTimeout(() => resolve(pagosMockData.map(normalizarPago)), 500));
        }
        
        try {
            const queryParams = new URLSearchParams();
            if (fechaInicio) queryParams.append('fechaInicio', fechaInicio.toISOString());
            if (fechaFin) queryParams.append('fechaFin', fechaFin.toISOString());
            
            const response = await apiClient.get(`/pagos/fechas?${queryParams.toString()}`);
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al obtener pagos por fecha.");

            const datosBrutos = resultado.Data ?? resultado.data ?? [];
            return Array.isArray(datosBrutos) ? datosBrutos.map(normalizarPago) : [];
        } catch (error: any) {
            if (error.response?.status === 404) return []; 
            throw manejarErrorHttp(error, "Fallo de conexión al filtrar el historial de pagos.");
        }
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT, DELETE (Operaciones críticas)
    // --------------------------------------------------------

    createAddPago: async (pago: PagoStandaloneCreateDTO, usuarioId: number) => {
        if(AppConfig.usarMocks) { 
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.post('/pagos', pago, {
                headers: { 'X-Usuario-Id': usuarioId } 
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al procesar el pago.");

            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Ocurrió un error al registrar el nuevo pago en el sistema.");
        }
    },

    update: async (id: number, pagoActualizado: PagoUpdateDTO, usuarioId: number) => {
        if(AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true, data : pagoActualizado }), 500));
        }
        
        try {
            // CORRECCIÓN CLAVE: Pasamos el 'usuarioId' por el HEADER, tal como lo espera C# [FromHeader]
            const response = await apiClient.put(`/pagos/${id}`, pagoActualizado, {
                headers: { 'X-Usuario-Id': usuarioId } 
            });
            
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al modificar el pago.");

            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "Ocurrió un error al actualizar la información del pago.");
        }
    },

    delete: async (id: number, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        
        try {
            const response = await apiClient.delete(`/pagos/${id}`, {
                headers: { 'X-Usuario-Id': usuarioId }
            });
            const resultado = response.data;
            const exito = resultado.Success ?? resultado.success ?? resultado.Exito ?? resultado.exito;

            if (exito === false) throw new Error(resultado.Message ?? resultado.mensaje ?? "Error al anular el pago.");

            return resultado;
        } catch (error: any) {
            throw manejarErrorHttp(error, "No se pudo anular este pago. Verifique los permisos del operador.");
        }
    }
};