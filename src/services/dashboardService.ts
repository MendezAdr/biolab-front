import { AppConfig } from '../config/ApiClient';
import { pacienteService } from './pacienteService';
import { ordenesService } from './ordenesService';

export interface MetricasDashboard {
  pacientesTotales: number;
  ordenesPendientes: number;
  ingresosDelMes: number;
  examenesTop: { nombre: string; cantidad: number }[];
  ventasSemanales: { semana: string; total: number }[];
}

const dashboardMockData: MetricasDashboard = {
  pacientesTotales: 142,
  ordenesPendientes: 18,
  ingresosDelMes: 1240.50,
  examenesTop: [
    { nombre: 'Hematología Completa', cantidad: 45 },
    { nombre: 'Perfil Lipídico', cantidad: 30 },
    { nombre: 'Glucosa', cantidad: 25 },
    { nombre: 'Heces', cantidad: 15 },
    { nombre: 'Orina', cantidad: 12 }
  ],
  ventasSemanales: [
    { semana: 'Sem 1', total: 350 },
    { semana: 'Sem 2', total: 420 },
    { semana: 'Sem 3', total: 290 },
    { semana: 'Sem 4', total: 180 }
  ]
};

// Estructura segura en caso de base de datos vacía
const metricasVacias: MetricasDashboard = {
    pacientesTotales: 0,
    ordenesPendientes: 0,
    ingresosDelMes: 0,
    examenesTop: [],
    ventasSemanales: [
      { semana: 'Sem 1', total: 0 },
      { semana: 'Sem 2', total: 0 },
      { semana: 'Sem 3', total: 0 },
      { semana: 'Sem 4', total: 0 }
    ]
};

export const dashboardService = {
  
  obtenerMetricasGenerales: async (usuarioId: number): Promise<MetricasDashboard> => {
    
    if (AppConfig.usarMocks) {
      console.warn("🔧 MOCK: Obteniendo métricas del dashboard simuladas");
      return new Promise((resolve) => {
        setTimeout(() => resolve(dashboardMockData), 800); 
      });
    }

    try {
      const ahora = new Date();
      const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);

      const [pacientesBD, ordenesMesBD] = await Promise.all([
        pacienteService.getAll(),
        ordenesService.getByFechas(primerDiaMes, ultimoDiaMes, usuarioId)
      ]);

      // CORRECCIÓN: Extraemos '.data' o el array si el backend retorna la lista directa,
      // y si viene null/undefined, forzamos un array vacío [] para que .filter() no colapse.
      const pacientesLista = pacientesBD?.Data || pacientesBD || [];
      const ordenesLista = ordenesMesBD?.Data || ordenesMesBD || [];

      // Si no hay datos en absoluto, devolvemos el cascarón vacío de inmediato
      if (!Array.isArray(ordenesLista) || ordenesLista.length === 0) {
          return { ...metricasVacias, pacientesTotales: pacientesLista.length };
      }

      const pacientesTotales = pacientesLista.length;
      const ordenesMes = ordenesLista;

      const ordenesPendientes = ordenesMes.filter((o: any) => o.EstadoPago === 2 || o.EstadoPago === 3 || o.Estado === 2).length;

      const ingresosDelMes = ordenesMes.reduce((suma: number, orden: any) => suma + (orden.TotalDivisa || 0), 0);

      const conteoExamenes: Record<string, number> = {};
      ordenesMes.forEach((orden: any) => {
          if (orden.Detalles && Array.isArray(orden.Detalles)) {
              orden.Detalles.forEach((detalle: any) => {
                  const nombre = detalle.ExamenNombre || 'Desconocido';
                  conteoExamenes[nombre] = (conteoExamenes[nombre] || 0) + 1;
              });
          }
      });
      
      const examenesTop = Object.entries(conteoExamenes)
          .map(([nombre, cantidad]) => ({ nombre, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 5); 

      const ventasSemanales = [
          { semana: 'Sem 1', total: 0 },
          { semana: 'Sem 2', total: 0 },
          { semana: 'Sem 3', total: 0 },
          { semana: 'Sem 4', total: 0 },
      ];
      
      ordenesMes.forEach((orden: any) => {
          const fecha = new Date(orden.FechaCreacion || orden.Fecha);
          const dia = fecha.getDate();
          const monto = orden.TotalDivisa || 0;
          
          if (dia <= 7) ventasSemanales[0].total += monto;
          else if (dia <= 14) ventasSemanales[1].total += monto;
          else if (dia <= 21) ventasSemanales[2].total += monto;
          else ventasSemanales[3].total += monto;
      });

      return {
          pacientesTotales,
          ordenesPendientes,
          ingresosDelMes,
          examenesTop,
          ventasSemanales
      };

    } catch (error) {
      console.error("Error crítico al compilar métricas reales:", error);
      // Fallback seguro: Si el servidor falla, el panel mostrará ceros en vez de una pantalla blanca
      return metricasVacias; 
    }
  }
};