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

  // SISTEMA DE PROMESA PARA ROLES
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

  if (cargando) return <div className="flex justify-center items-center h-64 text-slate-500">Cargando niveles de acceso...</div>;
  
  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center mx-auto max-w-2xl mt-8">
        <p className="font-semibold text-lg mb-2">Error de Conexión</p>
        <p className="text-sm mb-4">{error}</p>
        <button onClick={cargarRoles} className="px-4 py-2 bg-rose-100 hover:bg-rose-200 rounded-lg text-sm transition-colors">
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-4xl">
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-sky-700">Gestión de Roles y Privilegios</h2>
          <p className="text-sm text-slate-500">Configuración granular de los niveles de acceso al sistema</p>
        </div>
        
        <div className="inline-block" title={!puedeGestionarRoles ? "Solo el administrador puede definir nuevas jerarquías de seguridad." : ""}>
          <button 
            onClick={abrirModalCrear}
            disabled={!puedeGestionarRoles}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${!puedeGestionarRoles ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
          >
            + Definir Nuevo Rol
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="p-4">Identificador</th>
              <th className="p-4">Nombre del Rol</th>
              <th className="p-4">Nivel de Acceso</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {listaRoles.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400">
                  <p>No hay roles registrados en el sistema.</p>
                </td>
              </tr>
            ) : (
              listaRoles.map((rol) => {
                // EXTRACCIÓN SEGURA (camelCase)
                const id = rol.id;
                const rolName = rol.rolName;
                const permisos = rol.permisos || [];

                return (
                  <tr key={id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-medium text-slate-500">#{id}</td>
                    <td className="p-4 font-bold text-slate-800">{rolName}</td>
                    <td className="p-4">
                      <span className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs font-semibold border border-sky-100">
                        {permisos.length} privilegios asignados
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      
                      <div className="inline-block" title={!puedeGestionarRoles ? "Acceso denegado. Se requiere nivel de administrador." : ""}>
                        <button 
                          onClick={() => abrirModalEditar(rol)}
                          disabled={!puedeGestionarRoles}
                          className={`font-medium text-xs px-3 py-1.5 rounded transition-colors ${!puedeGestionarRoles ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-50 text-sky-600 hover:text-sky-800'}`}
                        >
                          Editar
                        </button>
                      </div>

                      <div className="inline-block" title={id === 1 ? "El rol de Administrador principal no puede ser eliminado." : !puedeGestionarRoles ? "Acceso denegado." : ""}>
                        <button 
                          onClick={() => eliminarRol(id, rolName)}
                          disabled={id === 1 || !puedeGestionarRoles}
                          className={`font-medium text-xs px-3 py-1.5 rounded transition-colors ${(id === 1 || !puedeGestionarRoles) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-rose-50 text-rose-600 hover:text-rose-800'}`}
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