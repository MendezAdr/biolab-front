import React from 'react';
import { PanelBienvenida } from '../shared/PanelBienvenida';
import type { EstadisticasResumen } from '../../types/dashboard';

export function HomePage() {
  
  /* ========================================================================
     ZONA DE BACKEND / INTERCÁMBIAME EN EL FUTURO
     Aquí es donde tu API de .NET calculará los totales reales.
     Por ahora pasamos este objeto mock con datos ficticios.
     ========================================================================
  */
  const metricasFicticias: EstadisticasResumen = {
    pacientesTotales: 142,
    examenesPendientes: 18,
    facturadoMes: "$1,240.00",
    usuariosActivos: 5
  };

  return (
    <PanelBienvenida 
      usuarioNombre="Yoali" 
      metricas={metricasFicticias} 
    />
  );
}