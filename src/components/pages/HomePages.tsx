import React, { useState, useEffect } from 'react';
import { PanelBienvenida } from '../shared/PanelBienvenida';
import { dashboardService, type MetricasDashboard } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';

export function HomePage() {
  const { usuario } = useAuth();
  
  // Extraemos datos seguros
  const nombreUsuario = usuario?.nombre || 'Operador';
  const currentUserId = usuario?.id || 1; 

  const [metricas, setMetricas] = useState<MetricasDashboard | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        // Le pasamos el ID del usuario al servicio para que lo use en los Headers
        const datos = await dashboardService.obtenerMetricasGenerales(currentUserId);
        setMetricas(datos);
      } catch (error) {
        console.error("Error al cargar las métricas:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, [currentUserId]);

  if (cargando) {
    return <div className="flex h-[80vh] items-center justify-center text-slate-500 animate-pulse font-medium">Cargando panel de control...</div>;
  }

  return (
    <PanelBienvenida 
      usuarioNombre={nombreUsuario} 
      metricas={metricas} 
    />
  );
}