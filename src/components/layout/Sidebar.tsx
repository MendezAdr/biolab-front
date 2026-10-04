import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  abierta: boolean;
  setAbierta: (abierta: boolean) => void;
}

export function Sidebar({ abierta, setAbierta }: SidebarProps) {
  const { usuario } = useAuth();
  
  const nombreUsuario = usuario?.nombre || 'Invitado';
  const rolUsuario = usuario?.rolNombre || 'Sin acceso';
  const iniciales = nombreUsuario.substring(0, 2).toUpperCase();
  
  const vincularClaseActiva = ({ isActive }: { isActive: boolean }) => {
    const clasesBase = "w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";
    
    if (isActive) {
      // ESTADO ACTIVO: Verde Esmeralda
      return `${clasesBase} bg-emerald-600 text-white shadow-md shadow-emerald-600/20 translate-x-1`;
    }
    
    // ESTADO INACTIVO: Texto oscuro, hover con sutil fondo Azul Claro
    return `${clasesBase} text-slate-100  hover:bg-sky-100 hover:text-sky-800`;
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen w-64 bg-sky-600/80 text-slate-100 border-r border-sky-700 p-4 flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out shadow-lg ${
        abierta ? 'translate-x-0' : '-translate-x-64'
      }`}
    >
      <div>
        {/* LOGO E IDENTIFICACIÓN DEL SISTEMA */}
        <div className="mb-6 bg-emerald-50/90 rounded-xl py-2 px-2 text-center shadow-sm  border-2 border-sky-700 flex flex-col items-center">
          {/* Implementación de tu logo PNG */}
          <img 
            src="/img/logo-RIV_CARR.png" 
            alt="Logo Laboratorio" 
            className="w-16 h-16 object-contain mb-2 drop-shadow-sm"
            onError={(e) => e.currentTarget.style.display = 'none'} // Lo oculta si la ruta falla
          />
          {/* Tipografía serif italic (profesional, inclinada, clásica) */}
          <h1 className="text-2xl font-serif italic font-bold text-sky-900 tracking-wide">
            RIV_CARR
          </h1>
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest mt-1">
            Laboratorio Clínico
          </span>
        </div>

        {/* MENÚ DE OPCIONES (Scrollable) */}
        <nav className="space-y-1.5 overflow-y-auto max-h-[55vh] pr-2 custom-scrollbar">
          <NavLink to="/nueva-orden" className={vincularClaseActiva}>
            <span className="text-lg">📋</span><span>Órdenes</span>
          </NavLink>
          <NavLink to="/historial-facturas" className={vincularClaseActiva}>
            <span className="text-lg">💳</span><span>Facturas</span>
          </NavLink>
          <NavLink to="/presupuestos" className={vincularClaseActiva}>
            <span className="text-lg">📊</span><span>Presupuestos</span>
          </NavLink>
          <NavLink to="/pagos" className={vincularClaseActiva}>
            <span className="text-lg">💰</span><span>Pagos</span>
          </NavLink>
          <NavLink to="/examenes" className={vincularClaseActiva}>
            <span className="text-lg">🔬</span><span>Exámenes</span>
          </NavLink>
          <NavLink to="/pacientes" className={vincularClaseActiva}>
            <span className="text-lg">📇</span><span>Pacientes</span>
          </NavLink>
          <NavLink to="/usuarios" className={vincularClaseActiva}>
            <span className="text-lg">👥</span><span>Usuarios</span>
          </NavLink>
          <NavLink to="/roles" className={vincularClaseActiva}>
            <span className="text-lg">⚙️</span><span>Roles y permisos</span>
          </NavLink>
          <NavLink to="/impresiones" className={vincularClaseActiva}>
            <span className="text-lg">🖨️</span><span>Impresiones</span>
          </NavLink>
        </nav>
      </div>

      {/* SECCIÓN INFERIOR: BOTÓN HOME Y PERFIL */}
      <div className="pt-2 flex flex-col space-y-3 border-t border-slate-200 mt-2">
        
        {/* BOTÓN REUBICADO: Panel Principal (Azul Claro) */}
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex items-center justify-center space-x-2 w-full py-2.5 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-sky-500 text-white shadow-md pointer-events-none' : 'bg-emerald-50 text-sky-700 hover:bg-sky-200 border border-sky-100'}`}
        >
          <span className="text-lg">🏠</span> 
          <span>Panel Principal</span>
        </NavLink>

        {/* PERFIL DE USUARIO */}
        <div className="flex items-center space-x-3 bg-emerald-50 p-2 rounded-xl border border-slate-100 shadow-sm">
          <div 
            className="w-10 h-10 rounded-full border-2 border-sky-500 bg-emerald-100 flex items-center justify-center font-bold text-sm text-emerald-800 cursor-pointer"
            title="Opciones de cuenta"
          >
            {iniciales}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate" title={nombreUsuario}>
              {nombreUsuario}
            </p>
            <p className="text-[11px] text-sky-600 font-semibold uppercase tracking-wider truncate" title={rolUsuario}>
              {rolUsuario}
            </p>
          </div>
        </div>
        
      </div>
    </aside>
  );
}