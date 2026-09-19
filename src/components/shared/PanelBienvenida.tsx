import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { MetricasDashboard } from '../../services/dashboardService';

interface PanelBienvenidaProps {
  usuarioNombre: string;
  metricas: MetricasDashboard | null;
}

export function PanelBienvenida({ usuarioNombre, metricas }: PanelBienvenidaProps) {
  // Colores para el gráfico de torta (Exámenes)
  const COLORES_PIE = ['#059669', '#0284c7', '#d97706', '#dc2626', '#7c3aed'];

  if (!metricas) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. CABECERA Y SALUDO */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">¡Hola, {usuarioNombre}! 👋</h1>
          <p className="text-slate-500 mt-1">Este es el resumen operativo de BioLab al día de hoy.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-emerald-700">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* 2. TARJETAS DE RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-emerald-700 text-sm font-semibold mb-1">Ingresos del Mes</p>
            <p className="text-2xl font-bold text-emerald-900">${metricas.ingresosDelMes.toFixed(2)}</p>
          </div>
          <div className="text-3xl">💰</div>
        </div>
        <div className="bg-sky-50 border border-sky-100 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sky-700 text-sm font-semibold mb-1">Pacientes Registrados</p>
            <p className="text-2xl font-bold text-sky-900">{metricas.pacientesTotales}</p>
          </div>
          <div className="text-3xl">👥</div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-amber-700 text-sm font-semibold mb-1">Órdenes Pendientes</p>
            <p className="text-2xl font-bold text-amber-900">{metricas.ordenesPendientes}</p>
          </div>
          <div className="text-3xl">⏳</div>
        </div>
      </div>

      {/* 3. ACCESOS RÁPIDOS AMIGABLES */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 mb-3">Accesos Directos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NavLink to="/nueva-orden" className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col items-center justify-center text-center group">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</span>
            <span className="font-semibold text-slate-700 text-sm">Nueva Orden</span>
          </NavLink>
          <NavLink to="/pacientes" className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col items-center justify-center text-center group">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📇</span>
            <span className="font-semibold text-slate-700 text-sm">Directorio Pacientes</span>
          </NavLink>
          <NavLink to="/pagos" className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col items-center justify-center text-center group">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">💳</span>
            <span className="font-semibold text-slate-700 text-sm">Caja y Abonos</span>
          </NavLink>
          <NavLink to="/impresiones" className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col items-center justify-center text-center group">
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</span>
            <span className="font-semibold text-slate-700 text-sm">Reportes Excel/PDF</span>
          </NavLink>
        </div>
      </div>

      {/* 4. GRÁFICOS INTERACTIVOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Barras: Ventas Semanales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4 border-b pb-2">Histórico de Ventas (Este Mes)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.ventasSemanales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="semana" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value: any) => [`$${value}`, 'Facturado']} />
                <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Torta: Exámenes Populares */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4 border-b pb-2">Exámenes Más Frecuentes</h2>
          <div className="h-64 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metricas.examenesTop}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="cantidad"
                >
                  {metricas.examenesTop.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES_PIE[index % COLORES_PIE.length]} />
                ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} órdenes`, 'Frecuencia']} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Leyenda manual a la derecha */}
            <div className="w-1/2 pl-4 space-y-2">
              {metricas.examenesTop.map((examen, index) => (
                <div key={index} className="flex items-center text-xs">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORES_PIE[index % COLORES_PIE.length] }}></span>
                  <span className="text-slate-600 truncate" title={examen.nombre}>{examen.nombre} ({examen.cantidad})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}