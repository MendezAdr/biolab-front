import React, { useState, useEffect } from 'react';
import { rolService } from '../../services/rolService';
import type { RolCreateDTO, RolUpdateDTO, RolResponseDTO } from '../../types/DTOs/RolDTOS';
import { ModalRol } from './ModalRoles';

export function TablaRoles() {
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
        alert(`El rol ${nombre} ha sido eliminado exitosamente.`);
        cargarRoles();
      } catch (err: any) {
        alert("No se pudo eliminar. Verifica que no existan usuarios que aún posean este rol asignado.");
      }
    }
  };

  const manejarGuardado = async (datos: RolCreateDTO | RolUpdateDTO) => {
    try {
      if ('Id' in datos) {
        await rolService.update(datos.Id, datos as RolUpdateDTO);
        alert("Privilegios del rol actualizados correctamente.");
      } else {
        await rolService.create(datos as RolCreateDTO);
        alert("Nuevo rol registrado con éxito en el sistema.");
      }
      setModalAbierto(false);
      cargarRoles(); 
    } catch (err: any) {
      console.error("Error al guardar rol:", err);
      alert("Ocurrió un error al procesar la solicitud de rol. Verifica que el nombre no esté duplicado.");
    }
  };

  if (cargando) return <div className="flex justify-center items-center h-64 text-slate-500">Cargando niveles de acceso...</div>;
  if (error) return <div className="p-6 text-rose-700 text-center">{error}</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-4xl">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-sky-700">Gestión de Roles y Privilegios</h2>
          <p className="text-sm text-slate-500">Configuración granular de los niveles de acceso al sistema</p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          + Definir Nuevo Rol
        </button>
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
              listaRoles.map((rol) => (
                <tr key={rol.Id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-medium text-slate-500">#{rol.Id}</td>
                  <td className="p-4 font-bold text-slate-800">{rol.RolName}</td>
                  <td className="p-4">
                    <span className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs font-semibold border border-sky-100">
                      {rol.Permisos.length} privilegios asignados
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button 
                      onClick={() => abrirModalEditar(rol)}
                      className="text-sky-600 hover:text-sky-800 font-medium text-xs bg-sky-50 px-3 py-1.5 rounded transition-colors"
                    >
                      Editar
                    </button>
                    {/* Opcional: Proteger el ID 1 para que el Admin Global nunca pueda ser borrado por accidente */}
                    <button 
                      onClick={() => eliminarRol(rol.Id, rol.RolName)}
                      disabled={rol.Id === 1}
                      className="text-rose-600 hover:text-rose-800 disabled:opacity-30 disabled:hover:text-rose-600 font-medium text-xs bg-rose-50 px-3 py-1.5 rounded transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
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