import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { MetricasDashboard } from '../../services/dashboardService';

interface PanelBienvenidaProps {
  usuarioNombre: string;
  metricas: MetricasDashboard | null;
}

export function PanelBienvenida({ usuarioNombre, metricas }: PanelBienvenidaProps) {
  // Paleta de colores para el gráfico de torta (Tonos fríos/azules y verdes)
  const COLORES_PIE = ['#38bdf8', '#10b981', '#0ea5e9', '#059669', '#bae6fd'];

  if (!metricas) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 bg-sky-200">
      
      {/* 1. CABECERA Y SALUDO (Hero Banner con Imagen de Fondo) */}
      <div 
        className="relative overflow-hidden rounded-xl shadow-md flex justify-between items-center p-8 bg-sky-900"
        style={{ 
          backgroundImage: "url('/src/assets/Bioanalisis.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Capa superpuesta azul oscuro para garantizar la legibilidad del texto */}
        <div className="absolute inset-0 bg-sky-900/85 mix-blend-multiply"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">¡Hola, {usuarioNombre}! 👋</h1>
          <p className="text-sky-100 mt-2 font-medium">Panel Operativo Principal del Laboratorio Clínico RIV_CARR.</p>
        </div>
        <div className="text-right hidden sm:block relative z-10">
          <div className="bg-sky-800/80 backdrop-blur-sm border border-sky-600 px-4 py-2 rounded-lg shadow-sm">
            <p className="text-sm font-bold text-sky-50 uppercase tracking-wider">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS DE RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta Azul Claro (Principal) */}
        <div className="bg-sky-50 border-l-4 border-l-sky-400 p-5 rounded-r-xl rounded-l-sm shadow-sm flex items-center justify-between hover:bg-sky-100 transition-colors">
          <div>
            <p className="text-sky-700 text-xs font-bold uppercase tracking-wider mb-1">Ingresos Facturados (Mes)</p>
            <p className="text-2xl font-black text-sky-900">${metricas.ingresosDelMes.toFixed(2)}</p>
          </div>
          <div className="text-4xl opacity-80">💰</div>
        </div>
        
        {/* Tarjeta Verde (Secundario) */}
        <div className="bg-emerald-50 border-l-4 border-l-emerald-500 p-5 rounded-r-xl rounded-l-sm shadow-sm flex items-center justify-between hover:bg-emerald-100 transition-colors">
          <div>
            <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">Pacientes Registrados</p>
            <p className="text-2xl font-black text-emerald-900">{metricas.pacientesTotales}</p>
          </div>
          <div className="text-4xl opacity-80">👥</div>
        </div>

        {/* Tarjeta Azul Oscuro (Alerta/Pendientes) */}
        <div className="bg-slate-50 border-l-4 border-l-slate-800 p-5 rounded-r-xl rounded-l-sm shadow-sm flex items-center justify-between hover:bg-slate-100 transition-colors">
          <div>
            <p className="text-slate-700 text-xs font-bold uppercase tracking-wider mb-1">Órdenes con Deuda</p>
            <p className="text-2xl font-black text-slate-900">{metricas.ordenesPendientes}</p>
          </div>
          <div className="text-4xl opacity-80">⏳</div>
        </div>
      </div>

      {/* 3. ACCESOS RÁPIDOS AMIGABLES */}
      <div>
        <h2 className="text-lg font-bold text-sky-900 mb-3 border-b border-sky-100 pb-2">Accesos Directos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NavLink to="/nueva-orden" className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-sky-400 hover:bg-sky-50 transition-all flex flex-col items-center justify-center text-center group">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:bg-sky-500 group-hover:text-white transition-colors">📋</div>
            <span className="font-bold text-slate-700 text-sm group-hover:text-sky-900">Nueva Orden</span>
          </NavLink>
          <NavLink to="/pacientes" className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-400 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center text-center group">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">📇</div>
            <span className="font-bold text-slate-700 text-sm group-hover:text-emerald-900">Directorio Pacientes</span>
          </NavLink>
          <NavLink to="/pagos" className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-sky-400 hover:bg-sky-50 transition-all flex flex-col items-center justify-center text-center group">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:bg-sky-500 group-hover:text-white transition-colors">💳</div>
            <span className="font-bold text-slate-700 text-sm group-hover:text-sky-900">Caja y Abonos</span>
          </NavLink>
          <NavLink to="/impresiones" className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-slate-400 hover:bg-slate-50 transition-all flex flex-col items-center justify-center text-center group">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-2xl mb-3 group-hover:bg-slate-700 group-hover:text-white transition-colors">📊</div>
            <span className="font-bold text-slate-700 text-sm group-hover:text-slate-900">Reportes PDF</span>
          </NavLink>
        </div>
      </div>

      {/* 4. GRÁFICOS INTERACTIVOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico de Barras: Ventas Semanales (Color Azul Claro) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-sky-900 mb-4 border-b border-sky-50 pb-2">Histórico de Ventas (Este Mes)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.ventasSemanales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="semana" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{fill: '#f0f9ff'}} formatter={(value: any) => [`$${value}`, 'Facturado']} />
                <Bar dataKey="total" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Torta: Exámenes Populares */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-sky-900 mb-4 border-b border-sky-50 pb-2">Exámenes Más Frecuentes</h2>
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
                  stroke="none"
                >
                  {metricas.examenesTop.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES_PIE[index % COLORES_PIE.length]} />
                ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} órdenes`, 'Frecuencia']} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Leyenda manual a la derecha */}
            <div className="w-1/2 pl-4 space-y-3">
              {metricas.examenesTop.map((examen, index) => (
                <div key={index} className="flex items-center text-xs">
                  <span className="w-3 h-3 rounded-sm mr-2 shadow-sm" style={{ backgroundColor: COLORES_PIE[index % COLORES_PIE.length] }}></span>
                  <span className="text-slate-700 font-medium truncate" title={examen.nombre}>{examen.nombre} <span className="text-slate-400 ml-1">({examen.cantidad})</span></span>
                </div>
              ))}
              {metricas.examenesTop.length === 0 && (
                  <span className="text-slate-400 text-xs italic">Aún no hay datos.</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}