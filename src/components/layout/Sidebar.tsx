import React from 'react';
import { NavLink } from 'react-router-dom';

export function Sidebar() {
  // Traducimos el estilo a una función reutilizable para evitar repetir código espagueti.
  // Si la ruta coincide con la URL actual, se pinta verde brillante. Si no, se queda gris con hover verde sutil.
  const vincularClaseActiva = ({ isActive }: { isActive: boolean }) => {
    const clasesBase = "w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200";
    
    if (isActive) {
      return `${clasesBase} bg-emerald-500 text-white font-semibold shadow-sm shadow-emerald-600/20`;
    }
    
    return `${clasesBase} text-slate-600 hover:bg-emerald-200 hover:text-emerald-700`;
  };

  return (
    // bg-slate-100: Fondo claro e institucional.
    // text-slate-800: Texto oscuro y legible para la barra.
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-100 text-slate-800 border-r border-slate-200 p-4 flex flex-col justify-between">
      <div>
        {/* LOGO O NOMBRE DEL SISTEMA */}
        <div className="mb-8 px-2">
          {/* text-emerald-700: Verde fuerte para contrastar sobre el fondo claro */}
          <h1 className="text-xl font-bold text-emerald-700 tracking-wider">BIOLAB</h1>
          <span className="text-xs text-slate-500">Gestión de Laboratorio</span>
        </div>

        {/* MENÚ DE OPCIONES */}
        <nav className="space-y-1.5">
          
          <NavLink to="/pacientes" className={vincularClaseActiva}>
            <span>📋</span>
            <span>Pacientes</span>
          </NavLink>

          <NavLink to="/usuarios" className={vincularClaseActiva}>
            <span>👥</span>
            <span>Usuarios</span>
          </NavLink>

          <NavLink to="/facturas" className={vincularClaseActiva}>
            <span>💳</span>
            <span>Facturas</span>
          </NavLink>

          <NavLink to="/examenes" className={vincularClaseActiva}>
            <span>🔬</span>
            <span>Exámenes</span>
          </NavLink>

          <NavLink to="/presupuestos" className={vincularClaseActiva}>
            <span>📊</span>
            <span>Presupuestos</span>
          </NavLink>

          <NavLink to="/impresiones" className={vincularClaseActiva}>
            <span>🖨️</span>
            <span>Impresiones</span>
          </NavLink>

        </nav>
      </div>

      {/* PERFIL DE USUARIO (Abajo en el menú) */}
      <div className="border-t border-slate-200 pt-4 flex items-center space-x-3">
        {/* Un avatar que cambia a verde oscuro al pasar el cursor */}
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-sm text-emerald-700 hover:bg-emerald-200 transition-colors cursor-pointer">
          AD
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Adrian</p>
          <p className="text-xs text-slate-400">Administrador</p>
        </div>
      </div>
    </aside>
  );
}