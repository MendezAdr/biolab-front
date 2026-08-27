import React from 'react';
import type { Usuario } from '../../types/usuario';
import { ModalNuevoUsuario } from './ModalNuevoUsuario';


export function TablaUsuarios({ }) {
  const [listaUsuarios, setListaUsuarios] = React.useState<Usuario[]>([
    { id: 1, nombre: 'Charles John', cedula: 'V-15.421.054', correo: 'charles.john@biolab.com', rol: 'Administrador', activo: true, ultimoAcceso: 'Hoy, 04:12 PM' },
    { id: 2, nombre: 'Mariana Pérez', cedula: 'V-16.789.012', correo: 'mariana.p@biolab.com', rol: 'Bioanalista', activo: true, ultimoAcceso: 'Ayer, 08:30 AM' },
    { id: 3, nombre: 'Carlos Mendoza', cedula: 'V-17.345.678', correo: 'carlos.m@biolab.com', rol: 'Recepcionista', activo: false, ultimoAcceso: '12/05/2026' },
    
  ]);

  const[modalAbierto, setModalAbierto] = React.useState(false);

  function manejarGuardarUsuario(usuarioNuevo: Usuario) {
    setListaUsuarios([usuarioNuevo, ...listaUsuarios]);
  }

  const usuariosById = [...listaUsuarios].sort(
    (b, a) => new Date(a.ultimoAcceso).getTime() - new Date(b.ultimoAcceso).getTime()
  );

  function Detalles() {
    alert('Función de detalles aún no implementada');
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-5xl">
      {/* Encabezado de la Tarjeta */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-sky-700">Control de Usuarios</h2>
          <p className="text-sm text-slate-500">Personal con acceso al sistema BioLab</p>
        </div>
        <button 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          onClick={() => setModalAbierto(true)}
        >
          + Registrar Personal
        </button>
      </div>

      {/* Tabla HTML con Tailwind */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-300/50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-emerald-800">
              <th className="p-4">Nombre / Correo</th>
              <th className="p-4">Rol Asignado</th>
              <th className="p-4">Último Acceso</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-800/40 text-sm text-emerald-300">
            {usuariosById.map((usuario) => (
              <tr key={usuario.id} onClick={Detalles} className="hover:bg-emerald-200/30 transition-colors cursor-pointer">
                {/* Nombre y Correo apilados para diseño profesional */}
                <td className="p-4">
                  <div className="font-semibold text-emerald-700 hover:text-emerald-950">{usuario.nombre}</div>
                  <div className="text-xs text-slate-400">{usuario.correo}</div>
                </td>
                
                <td className="p-4">
                  <span className={ `bg-${usuario.rol === 'Administrador' ? 'emerald' : usuario.rol === 'Bioanalista' ? 'blue' : 'yellow'}-100 text-${usuario.rol === 'Administrador' ? 'emerald' : usuario.rol === 'Bioanalista' ? 'blue' : 'yellow'}-700 px-2.5 py-1 rounded text-xs font-medium` }>
                    {usuario.rol}
                    
                  </span>
                </td>
                
                <td className="p-4 text-emerald-500">{usuario.ultimoAcceso}</td>
                
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
        <ModalNuevoUsuario 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          onGuardar={manejarGuardarUsuario} 
        />
       <div>
         {/* Espacio para futuros botones o información adicional */}
       </div>
      </div>
    </div>
  );
}