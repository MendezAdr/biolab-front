import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { rolService } from '../../services/rolService';
import type { RolCreateDTO, RolUpdateDTO, RolResponseDTO } from '../../types/DTOs/RolDTOS';
import { ModalRol } from './ModalRoles';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function TablaRoles() {
  const { tienePermiso } = useAuth();
  const puedeGestionarRoles = tienePermiso(PERMISOS.GESTIONAR_USUARIOS);

  const [listaRoles, setListaRoles] = useState<RolResponseDTO[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [rolAEditar, setRolAEditar] = useState<RolResponseDTO | null>(null);

  const cargarRoles = async () => {
    try {
      setCargando(true);
      setError(null); 
      const respuesta = await rolService.getAll();
      setListaRoles(respuesta || []); 
    } catch (err) {
      console.error("Error al obtener roles:", err);
      setError("No pudimos conectar con el servidor local para cargar los roles del sistema.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const abrirModalCrear = () => {
    setRolAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (rol: RolResponseDTO) => {
    setRolAEditar(rol);
    setModalAbierto(true);
  };

  const eliminarRol = async (id: number, nombre: string) => {
    if(window.confirm(`⚠️ ADVERTENCIA: ¿Estás seguro que deseas eliminar el rol "${nombre}"? Esta acción fallará si hay usuarios activos con este rol.`)) {
      try {
        await rolService.delete(id);
        toast.success(`El rol ${nombre} ha sido eliminado exitosamente.`);
        cargarRoles();
      } catch (err: any) {
        toast.error(err.message || "No se pudo eliminar el rol especificado.");
      }
    }
  };

  const manejarGuardado = async (datos: RolCreateDTO | RolUpdateDTO) => {
    toast.promise(
      (async () => {
        if ('id' in datos) {
          await rolService.update(datos.id, datos as RolUpdateDTO);
        } else {
          await rolService.create(datos as RolCreateDTO);
        }
        setModalAbierto(false);
        await cargarRoles(); 
      })(),
      {
        loading: 'Procesando configuración del rol...',
        success: '¡Privilegios registrados con éxito!',
        error: (err) => err.message || 'Ocurrió un error al guardar el rol.',
      }
    );
  };

  if (cargando) return <div className="flex justify-center items-center h-64 text-sky-600 font-medium animate-pulse">Cargando niveles de acceso...</div>;
  
  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center mx-auto max-w-2xl mt-8">
        <p className="font-bold text-lg mb-2">Error de Conexión</p>
        <p className="text-sm mb-4">{error}</p>
        <button onClick={cargarRoles} className="px-5 py-2.5 bg-rose-100 hover:bg-rose-200 rounded-xl font-bold text-sm transition-colors">
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-sky-100 rounded-xl overflow-hidden shadow-sm mx-auto max-w-4xl mt-6">
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* CABECERA PRINCIPAL */}
      <div className="p-5 border-b border-sky-50 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-xl font-bold text-sky-900">Gestión de Roles y Privilegios</h2>
          <p className="text-sm text-slate-500">Configuración granular de los niveles de acceso al sistema</p>
        </div>
        
        <div className="inline-block" title={!puedeGestionarRoles ? "Solo el administrador puede definir nuevas jerarquías de seguridad." : ""}>
          <button 
            onClick={abrirModalCrear}
            disabled={!puedeGestionarRoles}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${!puedeGestionarRoles ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-400 text-white hover:-translate-y-0.5'}`}
          >
            + Definir Nuevo Rol
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-sky-800 text-xs font-bold uppercase tracking-wider border-b border-sky-100 select-none">
              <th className="p-4 w-24 text-center">Identificador</th>
              <th className="p-4">Nombre del Rol</th>
              <th className="p-4">Nivel de Acceso</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {listaRoles.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-500 bg-slate-50/50 italic">
                  <p>No hay roles registrados en el sistema.</p>
                </td>
              </tr>
            ) : (
              listaRoles.map((rol) => {
                const id = rol.id;
                const rolName = rol.rolName;
                const permisos = rol.permisos || [];

                return (
                  <tr key={id} className="hover:bg-sky-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400 text-center">#{id}</td>
                    <td className="p-4 font-bold text-sky-900">{rolName}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-100 uppercase tracking-wider shadow-sm">
                        {permisos.length} privilegios
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      
                      <div className="inline-block" title={!puedeGestionarRoles ? "Acceso denegado. Se requiere nivel de administrador." : ""}>
                        <button 
                          onClick={() => abrirModalEditar(rol)}
                          disabled={!puedeGestionarRoles}
                          className={`font-bold text-xs px-3 py-1.5 rounded-lg transition-colors ${!puedeGestionarRoles ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100 hover:text-sky-800'}`}
                        >
                          Editar
                        </button>
                      </div>

                      <div className="inline-block" title={id === 1 ? "El rol de Administrador principal no puede ser eliminado." : !puedeGestionarRoles ? "Acceso denegado." : ""}>
                        <button 
                          onClick={() => eliminarRol(id, rolName)}
                          disabled={id === 1 || !puedeGestionarRoles}
                          className={`font-bold text-xs px-3 py-1.5 rounded-lg transition-colors border ${(id === 1 || !puedeGestionarRoles) ? 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed' : 'bg-rose-50 border-rose-100 text-rose-600 hover:text-rose-800 hover:bg-rose-100'}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        <ModalRol 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          onGuardar={manejarGuardado}
          rolExistente={rolAEditar}
        />
      </div>
    </div>
  );
}