import React from 'react';
import { NavLink } from 'react-router-dom';

// Definimos lo que el componente Sidebar necesita recibir desde el padre
interface SidebarProps {
  abierta: boolean;
  setAbierta: (abierta: boolean) => void;
}

export function Sidebar({ abierta, setAbierta }: SidebarProps) {
  
  const vincularClaseActiva = ({ isActive }: { isActive: boolean }) => {
    const clasesBase = "w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200";
    
    if (isActive) {
      return `${clasesBase} bg-emerald-600/90 text-slate-200 font-semibold shadow-sm shadow-slate-300/20 hover:bg-emerald-700/90 hover:text-slate-100`;
    }
    
    return `${clasesBase} text-slate-600 hover:bg-slate-100/90 hover:text-emerald-700`;
  };

  return (
    // 'transition-transform duration-300': Animación suave de deslizamiento.
    // '-translate-x-full': Esconde el menú completamente a la izquierda de la pantalla.
    // 'translate-x-0': Lo vuelve a traer al frente cuando abierta sea true.
    <aside 
      className={`fixed left-0 top-0 h-screen w-64 bg-emerald-200 text-slate-800 border-r border-slate-200 p-4 flex flex-col justify-between z-40 transition-transform duration-300 ease-in-out ${
        abierta ? 'translate-x-0' : '-translate-x-60'
      }`}
    >
      <div>
        {/* LOGO O NOMBRE DEL SISTEMA */}
        <div className="mb-8 px-2 bg-white rounded-lg py-3 text-center relative">
          <h1 className="text-xl font-bold text-emerald-700 tracking-wider">RIV_CARR</h1>
          <span className="text-xs text-slate-600">Gestión de Laboratorio</span>
        </div>

        {/* MENÚ DE OPCIONES */}
        <nav className="space-y-1.5">
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

      {/* PERFIL DE USUARIO */}
      <div className="border-t border-slate-200 pt-4 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-full border border-sky-800 bg-sky-200/80 flex items-center justify-center font-bold text-sm text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer">
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