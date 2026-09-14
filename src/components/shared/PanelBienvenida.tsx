import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { EstadisticasResumen } from '../../types/dashboard';

interface PanelBienvenidaProps {
  usuarioNombre: string;
  metricas: EstadisticasResumen;
}

export function PanelBienvenida({ usuarioNombre, metricas }: PanelBienvenidaProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 "
    
    >
      {/* Mensaje de Bienvenida Principal */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold mb-1">¡Hola de nuevo, {usuarioNombre}! 👋</h1>
        <p className="text-emerald-100 text-sm max-w-xl">
          El sistema BioLab está operativo. Aquí tienes un resumen rápido del estado del laboratorio para el día de hoy.
        </p>
      </div>

      {/* Bloques de Estadísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tarjeta 1: Pacientes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 text-xl">📋</div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pacientes Totales</p>
            <p className="text-2xl font-bold text-slate-800">{metricas.pacientesTotales}</p>
          </div>
        </div>

        {/* Tarjeta 2: Exámenes Pendientes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600 text-xl">🔬</div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pendientes de Análisis</p>
            <p className="text-2xl font-bold text-slate-800">{metricas.examenesPendientes}</p>
          </div>
        </div>

        {/* Tarjeta 3: Facturación */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-teal-50 text-teal-600 text-xl">💰</div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Facturado este Mes</p>
            <p className="text-2xl font-bold text-slate-800">{metricas.facturadoMes}</p>
          </div>
        </div>

        {/* Tarjeta 4: Personal */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 text-xl">👥</div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Personal Activo</p>
            <p className="text-2xl font-bold text-slate-800">{metricas.usuariosActivos}</p>
          </div>
        </div>

      </div>

      {/* Menú de Accesos Directos Operacionales */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4">Accesos Directos del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button 
            onClick={() => navigate('/pacientes')}
            className="group p-4 text-left border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/40 transition-all duration-200"
          >
            <span className="block text-2xl mb-2">👤</span>
            <span className="block font-semibold text-sm text-slate-800 group-hover:text-emerald-700">Registrar Paciente</span>
            <span className="block text-xs text-slate-400 mt-1">Ingresa nuevos datos filiatorios y órdenes.</span>
          </button>

          <button 
            onClick={() => navigate('/examenes')}
            className="group p-4 text-left border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/40 transition-all duration-200"
          >
            <span className="block text-2xl mb-2">🧪</span>
            <span className="block font-semibold text-sm text-slate-800 group-hover:text-emerald-700">Cargar Resultados</span>
            <span className="block text-xs text-slate-400 mt-1">Digita valores analíticos de las muestras.</span>
          </button>

          <button 
            onClick={() => navigate('/ordenes')}
            className="group p-4 text-left border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/40 transition-all duration-200"
          >
            <span className="block text-2xl mb-2">🧾</span>
            <span className="block font-semibold text-sm text-slate-800 group-hover:text-emerald-700">Nueva Factura</span>
            <span className="block text-xs text-slate-400 mt-1">Procesa cobros y emite comprobantes.</span>
          </button>

        </div>
      </div>
    </div>
  );
}