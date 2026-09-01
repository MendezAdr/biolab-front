import React, { useState, useEffect } from 'react';
import { usuariosService } from '../../services/usuarioService';
import { rolService } from '../../services/rolService';
import type { UsuarioCreateDTO } from '../../types/DTOs/UsuarioCreateDTO';
import type { Rol } from '../../types/DTOs/RolUsuarioEnum'; 
import { ModalNuevoUsuario } from './ModalNuevoUsuario';

export function TablaUsuarios() {
  const [listaUsuarios, setListaUsuarios] = useState<any[]>([]); 
  const [rolesDisponibles, setRolesDisponibles] = useState<Rol[]>([]); 
  
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // ID simulado del usuario actual usando el sistema
  const currentUserId = 1; 

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setError(null); 
      
      // Ejecutamos ambas peticiones en paralelo para optimizar tiempos de carga
      const [usuariosRes, rolesRes] = await Promise.all([
        usuariosService.getAll(currentUserId),
        rolService.getAll() 
      ]);
      
      setListaUsuarios(usuariosRes || []); 
      setRolesDisponibles(rolesRes || []);
      
    } catch (err) {
      console.error("Error al obtener datos:", err);
      setError("No pudimos conectar con el servidor local para cargar el personal. Por favor, verifica que el backend esté ejecutándose.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const manejarGuardarUsuario = async (nuevoUsuarioDTO: UsuarioCreateDTO) => {
    try {
      await usuariosService.create(nuevoUsuarioDTO, currentUserId);
      setModalAbierto(false);
      cargarDatosIniciales(); // Recargamos para reflejar el nuevo usuario
    } catch (err: any) {
      console.error("Error al crear usuario:", err);
      alert("Ocurrió un error al intentar registrar el usuario. Revisa los datos y vuelve a intentarlo.");
    }
  };

  // --- REDES DE SEGURIDAD (Manejo de Estados) ---

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
        <span className="animate-pulse">Conectando con la base de datos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center mx-auto max-w-2xl mt-8">
        <p className="font-semibold text-lg mb-2">Error de Conexión</p>
        <p className="text-sm mb-4">{error}</p>
        <button 
          onClick={cargarDatosIniciales} 
          className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-sm font-medium transition-colors"
        >
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-5xl">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-sky-700">Control de Usuarios</h2>
          <p className="text-sm text-slate-500">Personal con acceso al sistema BioLab</p>
        </div>
        <button 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          onClick={() => setModalAbierto(true)}
        >
          + Registrar Personal
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="p-4">Nombre / Usuario</th>
              <th className="p-4">Cédula</th>
              <th className="p-4">Rol Asignado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {/* MANEJO DE ESTADO VACÍO */}
            {listaUsuarios.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-12 text-center text-slate-400">
                  <p>No hay usuarios registrados en el sistema actualmente.</p>
                </td>
              </tr>
            ) : (
              listaUsuarios.map((usuario) => {
                // Buscamos el nombre del rol usando el ID que viene en el usuario
                const rolDelUsuario = rolesDisponibles.find(r => r.Id === usuario.rolId);
                const nombreRol = rolDelUsuario ? rolDelUsuario.Name : 'Rol Desconocido';

                return (
                  <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{usuario.nombre} {usuario.apellido}</div>
                      <div className="text-xs text-slate-400">@{usuario.username}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{usuario.cedula}</td>
                    <td className="p-4">
                      <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded text-xs font-medium border border-sky-100">
                        {nombreRol}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Pasamos los roles dinámicos como prop al modal */}
        <ModalNuevoUsuario 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          onGuardar={manejarGuardarUsuario} 
          roles={rolesDisponibles} 
        />
      </div>
    </div>
  );
}