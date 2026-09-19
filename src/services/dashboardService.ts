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

export const dashboardService = {
  
  // Ahora exigimos el usuarioId para poder hacer las peticiones protegidas
  obtenerMetricasGenerales: async (usuarioId: number): Promise<MetricasDashboard> => {
    
    if (AppConfig.usarMocks) {
      console.warn("🔧 MOCK: Obteniendo métricas del dashboard simuladas");
      return new Promise((resolve) => {
        setTimeout(() => resolve(dashboardMockData), 800); 
      });
    }

    try {
      // 1. Calculamos las fechas del mes actual
      const ahora = new Date();
      const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);

      // 2. Disparamos las peticiones en paralelo para mayor velocidad
      const [pacientesBD, ordenesMesBD] = await Promise.all([
        pacienteService.getAll(),
        ordenesService.getByFechas(primerDiaMes, ultimoDiaMes, usuarioId)
      ]);

      const pacientesTotales = pacientesBD ? pacientesBD.length : 0;
      const ordenesMes = ordenesMesBD || [];

      // 3. Órdenes Pendientes (Estado 2 = Pendiente, 3 = Parcial)
      const ordenesPendientes = ordenesMes.filter((o: any) => o.EstadoPago === 2 || o.EstadoPago === 3 || o.Estado === 2).length;

      // 4. Ingresos del Mes (Sumatoria del TotalDivisa de las facturas del mes)
      const ingresosDelMes = ordenesMes.reduce((suma: number, orden: any) => suma + (orden.TotalDivisa || 0), 0);

      // 5. Calcular los Exámenes más populares
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
          .slice(0, 5); // Tomamos solo los 5 más pedidos

      // 6. Calcular ventas semanales aproximadas
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

      // 7. Retornamos la estructura empaquetada y lista para graficar
      return {
          pacientesTotales,
          ordenesPendientes,
          ingresosDelMes,
          examenesTop,
          ventasSemanales
      };

    } catch (error) {
      console.error("Error crítico al compilar métricas reales:", error);
      throw error;
    }
  }
};