import React, { useState, useEffect } from 'react';
import { usuariosService } from '../../services/usuarioService';
import { rolService } from '../../services/rolService';
import type { UsuarioCreateDTO } from '../../types/DTOs/UsuarioCreateDTO';
import type { UsuarioUpdateDTO } from '../../types/DTOs/UsuarioUpdateDTO';
import type { Rol } from '../../types/DTOs/RolUsuarioEnum'; 
import { ModalNuevoUsuario } from './ModalNuevoUsuario';
import type { Usuario } from '../../types/UsuarioModel';

export function TablaUsuarios() {
  const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([]); 
  const [rolesDisponibles, setRolesDisponibles] = useState<Rol[]>([]); 
  
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Controles del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState<Usuario | null>(null);

  const currentUserId = 1; 

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
    cargarDatosIniciales();
  }, []);

  const abrirModalCrear = () => {
    setUsuarioAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario: Usuario) => {
    setUsuarioAEditar(usuario);
    setModalAbierto(true);
  };

  const desactivarUsuario = async (id: number, username: string) => {
    if(window.confirm(`⚠️ ADVERTENCIA: ¿Estás seguro que deseas desactivar el acceso al usuario "@${username}"?`)) {
      try {
        await usuariosService.deactivate(id, currentUserId);
        alert(`El usuario @${username} ha sido desactivado exitosamente.`);
        cargarDatosIniciales();
      } catch (err) {
        alert("Error al intentar desactivar la cuenta del usuario. Verifica tus permisos.");
      }
    }
  };

  const manejarGuardarUsuario = async (datos: UsuarioCreateDTO | UsuarioUpdateDTO) => {
    try {
      if ('Id' in datos) {
        // Modo Edición
        await usuariosService.updateUser(datos.Id, datos as UsuarioUpdateDTO, currentUserId);
        alert("Perfil de usuario actualizado correctamente.");
      } else {
        // Modo Creación
        await usuariosService.create(datos as UsuarioCreateDTO, currentUserId);
        alert("Nuevo usuario registrado con éxito.");
      }
      setModalAbierto(false);
      cargarDatosIniciales(); 
    } catch (err: any) {
      console.error("Error al guardar usuario:", err);
      alert("Ocurrió un error al intentar guardar los datos del usuario.");
    }
  };

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
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-emerald-800">Control de Usuarios</h2>
          <p className="text-sm text-slate-500">Personal con acceso al sistema BioLab</p>
        </div>
        <button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          onClick={abrirModalCrear}
        >
          + Registrar Personal
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="p-4">Nombre / Usuario</th>
              <th className="p-4">Cédula</th>
              <th className="p-4">Rol Asignado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {listaUsuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400">
                  <p>No hay usuarios registrados en el sistema actualmente.</p>
                </td>
              </tr>
            ) : (
              listaUsuarios.map((usuario) => {
                const rolDelUsuario = rolesDisponibles.find(r => r.Id === usuario.RolId);
                const nombreRol = rolDelUsuario ? rolDelUsuario.Name : 'Rol Desconocido';

                return (
                  <tr key={usuario.Id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{usuario.Nombre} {usuario.Apellido}</div>
                      <div className="text-xs text-slate-400">@{usuario.Username}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{usuario.Cedula}</td>
                    <td className="p-4">
                      <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded text-xs font-medium border border-sky-100">
                        {nombreRol}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button 
                        onClick={() => abrirModalEditar(usuario)}
                        className="text-sky-600 hover:text-sky-800 font-medium text-xs bg-sky-50 px-3 py-1.5 rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => desactivarUsuario(usuario.Id, usuario.Username)}
                        className="text-rose-600 hover:text-rose-800 font-medium text-xs bg-rose-50 px-3 py-1.5 rounded transition-colors"
                      >
                        Desactivar
                      </button>
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