import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast'; 
import { usuariosService } from '../../services/usuarioService';
import { rolService } from '../../services/rolService';
import type { UsuarioCreateDTO } from '../../types/DTOs/UsuarioCreateDTO';
import type { UsuarioUpdateDTO } from '../../types/DTOs/UsuarioUpdateDTO';
import type { RolResponseDTO } from '../../types/DTOs/RolDTOS'; 
import { ModalNuevoUsuario } from './ModalNuevoUsuario';
import type { Usuario } from '../../types/UsuarioModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function TablaUsuarios() {
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 

  const puedeGestionarUsuarios = tienePermiso(PERMISOS.GESTIONAR_USUARIOS);

  const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([]); 
  const [rolesDisponibles, setRolesDisponibles] = useState<RolResponseDTO[]>([]); 
  
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState<Usuario | null>(null);

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setError(null); 
      
      const [usuariosRes, rolesRes] = await Promise.all([
        usuariosService.getAll(currentUserId),
        rolService.getAll() 
      ]);
      
      setListaUsuarios(usuariosRes || []); 
      setRolesDisponibles(rolesRes || []);
      
    } catch (err) {
      console.error("Error al obtener datos:", err);
      setError("No pudimos conectar con el servidor local para cargar el personal.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // LA SOLUCIÓN: Si no tiene permisos, ni siquiera intentamos hacer la petición al backend
    if (puedeGestionarUsuarios) {
      cargarDatosIniciales();
    } else {
      setCargando(false);
    }
  }, [puedeGestionarUsuarios]);

  const abrirModalCrear = () => {
    setUsuarioAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario: Usuario) => {
    setUsuarioAEditar(usuario);
    setModalAbierto(true);
  };

  const alternarEstadoUsuario = async (id: number, username: string, estadoActual: boolean) => {
    const accion = estadoActual ? 'desactivar' : 'activar';
    
    if(window.confirm(`⚠️ ADVERTENCIA: ¿Estás seguro que deseas ${accion} el acceso al usuario "@${username}"?`)) {
      try {
        if (estadoActual) {
          await usuariosService.deactivate(id, currentUserId);
        } else {
          await usuariosService.activate(id, currentUserId);
        }
        toast.success(`La cuenta de @${username} ha sido ${estadoActual ? 'desactivada' : 'activada'} exitosamente.`);
        cargarDatosIniciales();
      } catch (err: any) {
        toast.error(err.message || `Error al intentar ${accion} la cuenta.`);
      }
    }
  };

  const manejarGuardarUsuario = async (datos: UsuarioCreateDTO | UsuarioUpdateDTO) => {
    toast.promise(
      (async () => {
        if ('id' in datos) {
          await usuariosService.updateUser(datos.id, datos as UsuarioUpdateDTO, currentUserId);
        } else {
          await usuariosService.create(datos as UsuarioCreateDTO, currentUserId);
        }
        setModalAbierto(false);
        await cargarDatosIniciales(); 
      })(),
      {
        loading: 'Procesando usuario...',
        success: '¡Registro guardado con éxito!',
        error: (err) => err.message || 'Ocurrió un error al guardar los datos.',
      }
    );
  };

  // PANTALLA DE PROTECCIÓN: Si no tiene permisos, mostramos esto y evitamos renderizar la tabla
  if (!puedeGestionarUsuarios) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-xl shadow-sm mx-auto max-w-2xl mt-12 text-center">
        <span className="text-6xl mb-4 opacity-80">🔒</span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
        <p className="text-slate-500">
          Tu nivel de acceso actual no te permite visualizar ni administrar la información del personal del laboratorio.
        </p>
      </div>
    );
  }

  if (cargando) {
    return <div className="flex justify-center items-center h-64 text-slate-500">Cargando base de datos del personal...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center mx-auto max-w-2xl mt-8">
        <p className="font-semibold text-lg mb-2">Error de Conexión</p>
        <p className="text-sm mb-4">{error}</p>
        <button onClick={cargarDatosIniciales} className="px-4 py-2 bg-rose-100 hover:bg-rose-200 rounded-lg text-sm transition-colors">
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-5xl">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-emerald-800">Control de Usuarios</h2>
          <p className="text-sm text-slate-500">Personal con acceso al sistema BioLab</p>
        </div>
        
        <div className="inline-block">
          <button 
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={abrirModalCrear}
          >
            + Registrar Personal
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="p-4">Nombre y Apellido</th>
              <th className="p-4">Usuario (Login)</th>
              <th className="p-4">Rol Asignado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {listaUsuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400">
                  <p>No hay personal registrado en el sistema actualmente.</p>
                </td>
              </tr>
            ) : (
              listaUsuarios.map((user) => {
                const id = user.id;
                const nombreCompleto = `${user.nombre} ${user.apellido}`;
                const username = user.username;
                const isActive = user.isActive ?? (user as any).IsActive ?? true;

                const rolEncontrado = rolesDisponibles.find(r => r.id === (user as any).rolId);
                const rolNombre = rolEncontrado?.rolName ?? (user as any).rolName ?? (user as any).rolNombre ?? 'Sin Rol';
                
                return (
                  <tr key={id} className={`transition-colors ${!isActive ? 'bg-rose-50/40 opacity-75' : 'hover:bg-slate-50'}`}>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">
                        {nombreCompleto}
                        {!isActive && (
                          <span className="ml-2 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Desactivado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{user.cedula}</div>
                    </td>
                    <td className="p-4 font-medium text-emerald-700">@{username}</td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded text-xs font-medium border border-emerald-100">
                        {rolNombre}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      
                      <div className="inline-block">
                        <button 
                          onClick={() => abrirModalEditar(user)}
                          className="font-medium text-xs px-3 py-1.5 rounded transition-colors bg-sky-50 text-sky-600 hover:text-sky-800"
                        >
                          Editar
                        </button>
                      </div>

                      <div className="inline-block" title={currentUserId === id ? "No puedes suspender tu propia cuenta activa." : ""}>
                        <button 
                          onClick={() => alternarEstadoUsuario(id, username, isActive)}
                          disabled={currentUserId === id} 
                          className={`font-medium text-xs px-3 py-1.5 rounded transition-colors ${
                            currentUserId === id
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : isActive 
                                ? 'bg-rose-50 text-rose-600 hover:text-rose-800' 
                                : 'bg-emerald-50 text-emerald-600 hover:text-emerald-800'
                          }`}
                        >
                          {isActive ? 'Suspender' : 'Reactivar'}
                        </button>
                      </div>

                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        <ModalNuevoUsuario 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          onGuardar={manejarGuardarUsuario} 
          roles={rolesDisponibles} 
          usuarioExistente={usuarioAEditar}
        />
      </div>
    </div>
  );
}