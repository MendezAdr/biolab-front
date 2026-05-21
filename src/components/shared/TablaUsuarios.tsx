import React from 'react';
import type { Usuario } from '../../types/usuario';

// Definimos el contrato de entrada (Props) para el componente
interface TablaUsuariosProps {
  usuarios: Usuario[];
}

export function TablaUsuarios({ usuarios }: TablaUsuariosProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Encabezado de la Tarjeta */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Control de Usuarios</h2>
          <p className="text-sm text-slate-500">Personal con acceso al sistema BioLab</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm">
          + Registrar Personal
        </button>
      </div>

      {/* Tabla HTML con Tailwind */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <th className="p-4">Nombre / Correo</th>
              <th className="p-4">Rol Asignado</th>
              <th className="p-4">Último Acceso</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                {/* Nombre y Correo apilados para diseño profesional */}
                <td className="p-4">
                  <div className="font-semibold text-slate-800">{usuario.nombre}</div>
                  <div className="text-xs text-slate-400">{usuario.correo}</div>
                </td>
                
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-xs font-medium">
                    {usuario.rol}
                  </span>
                </td>
                
                <td className="p-4 text-slate-500">{usuario.ultimoAcceso}</td>
                
                <td className="p-4">
                  {/* Etiqueta dinámica de colores para Activo/Inactivo */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    usuario.activo 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}