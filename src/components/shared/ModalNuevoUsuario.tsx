import React, { useState, useEffect } from 'react';
import type { UsuarioCreateDTO } from '../../types/DTOs/UsuarioCreateDTO';
import type { UsuarioUpdateDTO } from '../../types/DTOs/UsuarioUpdateDTO';
import type { RolResponseDTO } from '../../types/DTOs/RolDTOS'; 
import type { Usuario } from '../../types/UsuarioModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

interface ModalNuevoUsuarioProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (datos: UsuarioCreateDTO | UsuarioUpdateDTO) => void; 
  roles: RolResponseDTO[]; 
  usuarioExistente: Usuario | null; 
}

export function ModalNuevoUsuario({ isOpen, onClose, onGuardar, roles, usuarioExistente }: ModalNuevoUsuarioProps) {
  const { tienePermiso } = useAuth();
  const puedeGestionarUsuarios = tienePermiso(PERMISOS.GESTIONAR_USUARIOS);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [username, setUsername] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rolId, setRolId] = useState<number>(0); 

  const esModoEdicion = !!usuarioExistente;

  useEffect(() => {
    if (isOpen) {
      if (esModoEdicion && usuarioExistente) {
        // CORRECCIÓN: Lectura estricta en camelCase según el nuevo estándar
        setNombre(usuarioExistente.nombre);
        setApellido(usuarioExistente.apellido);
        setCedula(usuarioExistente.cedula);
        setUsername(usuarioExistente.username);
        setRolId(usuarioExistente.rolId);
        setContrasena(''); 
      } else {
        setNombre(''); setApellido(''); setCedula(''); setUsername(''); setContrasena('');
        setRolId(0);
      }
    }
  }, [isOpen, usuarioExistente, esModoEdicion]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!nombre || !apellido || !cedula || !username || rolId === 0) {
      alert("Por favor, rellena todos los campos obligatorios y selecciona un rol.");
      return;
    }

    // CORRECCIÓN: Estructura del payload en estricto camelCase
    if (esModoEdicion && usuarioExistente) {
      const usuarioActualizado: UsuarioUpdateDTO = {
        id: usuarioExistente.id,
        username: username,
        nombre: nombre,
        apellido: apellido,
        cedula: cedula,
        rolId: rolId
      };
      onGuardar(usuarioActualizado);
    } else {
      if (!contrasena) {
        alert("La contraseña es obligatoria para nuevos usuarios.");
        return;
      }
      const usuarioCreado: UsuarioCreateDTO = {
        username: username,
        nombre: nombre,
        apellido: apellido,
        cedula: cedula,
        contrasena: contrasena,
        rolId: rolId, 
      };
      onGuardar(usuarioCreado); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
        
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h3 className="text-lg font-bold text-slate-800">
            {esModoEdicion ? 'Actualizar Perfil de Usuario' : 'Registrar Credenciales'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombres *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Apellidos *</label>
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cédula *</label>
            <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:border-emerald-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Usuario (Login) *</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={esModoEdicion} className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:border-emerald-500 ${esModoEdicion ? 'opacity-60 cursor-not-allowed' : ''}`} />
            </div>
            
            {!esModoEdicion && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contraseña *</label>
                <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:border-emerald-500" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nivel de Acceso *</label>
            <select
              value={rolId}
              onChange={(e) => setRolId(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value={0} disabled>Seleccione un rol...</option>
              {roles.map((rol: any) => {
                // Extracción segura por si el DTO de roles aún no ha sido refactorizado
                const rId = rol.id ?? rol.Id;
                const rNombre = rol.rolName ?? rol.RolName ?? rol.nombre ?? "Rol Desconocido";
                return (
                  <option key={rId} value={rId}>{rNombre}</option>
                );
              })}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            
            <div className="inline-block" title={!puedeGestionarUsuarios ? "No posees los privilegios necesarios para guardar perfiles de usuario." : ""}>
              <button 
                type="submit" 
                disabled={!puedeGestionarUsuarios}
                className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors ${!puedeGestionarUsuarios ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : esModoEdicion ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
              >
                {esModoEdicion ? 'Guardar Cambios' : 'Registrar Credenciales'}
              </button>
            </div>
            
          </div>
        </form>
      </div>
    </div>
  );
}