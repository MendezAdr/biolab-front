import { apiClient } from '../config/ApiClient'; 
import { AppConfig } from '../config/ApiClient';
import type { OrdenCreateDTO } from '../types/DTOs/OrdenCreateDTO'; 
import type { OrdenUpdateDTO } from '../types/DTOs/OrdenUpdateDTO';
import { EstadoPago } from '../types/DTOs/EstadoPagoEnum'; 


const ordenesMockData = [
    {
        Id: 1,
        PacienteId: 201,
        FechaCreacion: '2024-01-15T10:30:00Z',
        TotalDivisa: 150.00,
        EstadoPago: EstadoPago.Pagado,
        NumeroFactura: 'FAC-001',
        TasaBcv: 100.11 ,
        Detalles: [
            { Id: 1, OrdenId: 1, ExamenId: 101, ExamenNombre: "Examen 1", PrecioMomentoDivisa: 50.00},
            { Id: 2, OrdenId: 1, ExamenId: 102, ExamenNombre: "Examen 2", PrecioMomentoDivisa: 100.00 }
        ],
        Pagos: [
            { Id: 1, OrdenId: 1, Monto: 150.00, Metodo: 1, Referencia: 'ABC123XYZ' }
        ]
    },
    {
        Id: 2,
        PacienteId: 202,
        FechaCreacion: '2024-01-16T11:00:00Z',
        TotalDivisa: 200.00,
        EstadoPago: EstadoPago.Pendiente,
        NumeroFactura: 'FAC-002', 
        TasaBcv : 100.11,
        Detalles: [
            { Id: 3, OrdenId: 2, ExamenId: 103, ExamenNombre: "Examen 3", PrecioMomentoDivisa: 200.00 }
        ],
        Pagos: []
    },
    {
        Id: 3,
        PacienteId: 203,
        FechaCreacion: '2024-01-17T09:45:00Z',
        TotalDivisa: 250.00,
        EstadoPago: EstadoPago.Pagado,
        NumeroFactura : 'FAC-003',
        TasaBcv : 100.11,
        Detalles: [
            { Id: 4, OrdenId: 3, ExamenId: 104, ExamenNombre: "Examen 4", PrecioMomentoDivisa: 150.00},
            { Id: 5, OrdenId: 3, ExamenId: 105, ExamenNombre: "Examen 5", PrecioMomentoDivisa: 100.00}
        ],
        Pagos: [
            { Id: 2, OrdenId: 3, Monto: 250.00, Metodo: 2, Referencia: 'DEF456UVW' }
        ]
    }
];
export const ordenesService = {
    // --------------------------------------------------------
    // MÉTODOS GET
    // --------------------------------------------------------
    

    // obtener todos los registros de ordenes
    getAll: async (adminId: number) => {
        // Se pasa el X-Admin-Id en el objeto de configuración de headers

        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo ordenes simuladas");
            return new Promise((resolve) => {
                setTimeout(() => resolve(ordenesMockData), 500);
            });
        }
        const response = await apiClient.get('/ordenes', {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },

    // RF-13: Obtener orden por ID con sus detalles y pagos
    // obtener por id
    getById: async (id: number, adminId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo orden simulada por ID");
            return new Promise((resolve) => {
                setTimeout(() => resolve(ordenesMockData.find(o => o.Id === id)), 500);
            });
        }
        const response = await apiClient.get(`/ordenes/${id}`, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },

    // RF-13: Consultar histórico por rango de fechas
    // obtener por rango de fechas
    getByFechas: async (inicio: Date, fin: Date, adminId: number) => {
        // Convertimos las fechas a formato ISO para enviarlas por Query Params
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo ordenes simuladas por rango de fechas");
            return new Promise((resolve) => {
                setTimeout(() => resolve(ordenesMockData), 500);
            });
        }
        const queryParams = new URLSearchParams({
            inicio: inicio.toISOString(),
            fin: fin.toISOString()
        });
        
        const response = await apiClient.get(`/ordenes/rango?${queryParams.toString()}`, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },
    // obtener por paciente
    getByPaciente: async (pacienteId: number, adminId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo ordenes simuladas por paciente");
            return new Promise((resolve) => {
                setTimeout(() => resolve(ordenesMockData.filter(o => o.PacienteId === pacienteId)), 500);
            });
        }
        const response = await apiClient.get(`/ordenes/paciente/${pacienteId}`, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },
    // RF-13: Consultar histórico por estado de pago
    // obtener por estado de pago
    getByEstado: async (estado: EstadoPago, adminId: number) => {
        // Nota: asumiendo que 'estado' es un número basado en tu enum EstadoPago[cite: 18]
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Obteniendo ordenes simuladas por estado de pago");
            return new Promise((resolve) => {
                setTimeout(() => resolve(ordenesMockData.filter(o => o.EstadoPago === estado)), 500);
            });
        }
        const response = await apiClient.get(`/ordenes/estado/${estado}`, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },

    // --------------------------------------------------------
    // MÉTODOS POST, PUT, PATCH
    // --------------------------------------------------------

    // RF-15: Procesar una nueva venta/orden completa
    // crear una nueva orden
    create: async (nuevaOrden: OrdenCreateDTO, usuarioId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando creación de orden", nuevaOrden);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        // Para POST, el segundo parámetro es el body (nuevaOrden), el tercero es la configuración[cite: 18]
        const response = await apiClient.post('/ordenes', nuevaOrden, {
            headers: { 'X-Usuario-Id': usuarioId } 
        });
        return response.data;
    },

    // RF-18: Anulación de ventas (Cambio de estado)
    // anular una orden existente
    anular: async (id: number, adminId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando anulación de orden", id);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        // En PATCH, si no hay body, enviamos un objeto vacío o null como segundo parámetro
        const response = await apiClient.patch(`/ordenes/${id}/anular`, {}, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    },
    // actualizar una orden existente
    update: async (id: number, ordenActualizada: OrdenUpdateDTO, adminId: number) => {
        if (AppConfig.usarMocks) {
            console.warn("🔧 MOCK: Simulando actualización de orden", ordenActualizada);
            return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
        }
        // Se envía el objeto OrdenUpdateDTO en el body
        const response = await apiClient.put(`/ordenes/${id}/actualizar`, ordenActualizada, {
            headers: { 'X-Admin-Id': adminId }
        });
        return response.data;
    }
};