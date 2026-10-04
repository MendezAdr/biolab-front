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
      return metricasVacias; // Retiramos el mock para forzar datos reales
    }

    try {
      const ahora = new Date();
      const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);

      const [pacientesBD, ordenesMesBD] = await Promise.all([
        pacienteService.getAll(),
        ordenesService.getByFechas(primerDiaMes, ultimoDiaMes, usuarioId)
      ]);

      const pacientesLista = pacientesBD?.Data || pacientesBD || [];
      const ordenesLista = ordenesMesBD?.Data || ordenesMesBD || [];

      if (!Array.isArray(ordenesLista) || ordenesLista.length === 0) {
          return { ...metricasVacias, pacientesTotales: pacientesLista.length };
      }

      const pacientesTotales = pacientesLista.length;
      const ordenesMes = ordenesLista;

      // EXTRACCIÓN SEGURA (camelCase y PascalCase)
      const ordenesPendientes = ordenesMes.filter((o: any) => {
        const estPago = o.estadoPago ?? o.EstadoPago;
        const est = o.estado ?? o.Estado;
        return estPago === 2 || estPago === 3 || est === 2;
      }).length;

      // Sumar TotalDivisa de forma tolerante
      const ingresosDelMes = ordenesMes.reduce((suma: number, orden: any) => {
        const monto = orden.totalDivisa ?? orden.TotalDivisa ?? 0;
        return suma + monto;
      }, 0);

      const conteoExamenes: Record<string, number> = {};
      ordenesMes.forEach((orden: any) => {
          const detalles = orden.detalles ?? orden.Detalles ?? [];
          if (Array.isArray(detalles)) {
              detalles.forEach((detalle: any) => {
                  const nombre = detalle.examenNombre ?? detalle.ExamenNombre ?? 'Desconocido';
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
          const fechaStr = orden.fechaOrden ?? orden.FechaOrden ?? orden.fechaCreacion ?? orden.FechaCreacion;
          const fecha = new Date(fechaStr || new Date());
          const dia = fecha.getDate();
          const monto = orden.totalDivisa ?? orden.TotalDivisa ?? 0;
          
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
      return metricasVacias; 
    }
  }
};