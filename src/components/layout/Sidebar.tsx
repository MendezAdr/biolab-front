import React from 'react';
import { NavLink } from 'react-router-dom';

// 1. IMPORTAMOS EL CONTEXTO GLOBAL
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  abierta: boolean;
  setAbierta: (abierta: boolean) => void;
}

export function Sidebar({ abierta, setAbierta }: SidebarProps) {
  // 2. EXTRAEMOS LA SESIÓN ACTUAL
  const { usuario } = useAuth();
  
  // Variables seguras con fallbacks en caso de que la sesión aún esté cargando
  const nombreUsuario = usuario?.nombre || 'Invitado';
  const rolUsuario = usuario?.rolNombre || 'Sin acceso';
  
  // Extraemos las primeras dos letras del nombre para el círculo del avatar
  const iniciales = nombreUsuario.substring(0, 2).toUpperCase();
  
  const vincularClaseActiva = ({ isActive }: { isActive: boolean }) => {
    const clasesBase = "w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200";
    
    if (isActive) {
      return `${clasesBase} bg-emerald-600/90 text-slate-200 font-semibold shadow-sm shadow-slate-300/20 hover:bg-emerald-700/90 hover:text-slate-100`;
    }
    
    return `${clasesBase} text-slate-600 hover:bg-slate-100/90 hover:text-emerald-700`;
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen w-64 bg-emerald-200 text-slate-800 border-r border-slate-200 p-4 flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out ${
        abierta ? 'translate-x-0' : '-translate-x-60'
      }`}
    >
      <div>
        {/* LOGO O NOMBRE DEL SISTEMA */}
        <div className="mb-6 px-2 bg-white rounded-lg py-3 text-center relative shadow-sm border border-emerald-100">
          <h1 className="text-xl font-bold text-emerald-700 tracking-wider">RIV_CARR</h1>
          <span className="text-xs text-slate-600">Gestión de Laboratorio</span>
        </div>

        {/* BOTÓN DISCRETO DE VOLVER AL INICIO */}
        <div className="mb-4 px-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex items-center text-xs font-medium transition-colors ${isActive ? 'text-emerald-700 pointer-events-none' : 'text-slate-500 hover:text-emerald-700'}`}
          >
            <span className="mr-2">←</span> 
            Volver al Panel Principal
          </NavLink>
        </div>

        {/* MENÚ DE OPCIONES */}
        <nav className="space-y-1.5 overflow-y-auto max-h-[60vh] pr-1">
          <NavLink to="/nueva-orden" className={vincularClaseActiva}>
            <span>📋</span>
            <span>Órdenes</span>
          </NavLink>

          <NavLink to="/historial-facturas" className={vincularClaseActiva}>
            <span>💳</span>
            <span>Facturas</span>
          </NavLink>

          <NavLink to="/presupuestos" className={vincularClaseActiva}>
            <span>📊</span>
            <span>Presupuestos</span>
          </NavLink>

          <NavLink to="/pagos" className={vincularClaseActiva}>
            <span>💰</span>
            <span>Pagos</span>
          </NavLink>

          <NavLink to="/examenes" className={vincularClaseActiva}>
            <span>🔬</span>
            <span>Exámenes</span>
          </NavLink>

          <NavLink to="/pacientes" className={vincularClaseActiva}>
            <span>📋</span>
            <span>Pacientes</span>
          </NavLink>

          <NavLink to="/usuarios" className={vincularClaseActiva}>
            <span>👥</span>
            <span>Usuarios</span>
          </NavLink>

          <NavLink to="/roles" className={vincularClaseActiva}>
            <span>⚙️</span>
            <span>Roles y permisos</span>
          </NavLink>
        
          <NavLink to="/impresiones" className={vincularClaseActiva}>
            <span>🖨️</span>
            <span>Impresiones</span>
          </NavLink>
        </nav>
      </div>

      {/* PERFIL DE USUARIO DINÁMICO */}
      <div className="border-t border-slate-300 pt-4 flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded-full border border-sky-800 bg-sky-200/80 flex items-center justify-center font-bold text-sm text-emerald-800 hover:bg-white transition-colors cursor-pointer shadow-sm"
          title="Opciones de cuenta"
        >
          {iniciales}
        </div>
        <div className="flex-1 overflow-hidden">
          {/* Usamos truncate por si el nombre es muy largo y rompe el diseño */}
          <p className="text-sm font-semibold text-slate-800 truncate" title={nombreUsuario}>
            {nombreUsuario}
          </p>
          <p className="text-xs text-slate-600 font-medium truncate" title={rolUsuario}>
            {rolUsuario}
          </p>
        </div>
      </div>
    </aside>
  );
}