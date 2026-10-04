import React, { useState, useEffect } from 'react';
import type { UsuarioCreateDTO } from '../../types/DTOs/UsuarioCreateDTO';
import type { UsuarioUpdateDTO } from '../../types/DTOs/UsuarioUpdateDTO';
import type { RolResponseDTO } from '../../types/DTOs/RolDTOS'; 
import type { Usuario } from '../../types/UsuarioModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';
import { AuditoriaFooter } from './AuditoriaFooter';

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
      <div className="absolute inset-0 bg-sky-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-md w-full p-7">
        
        <div className="flex justify-between items-center mb-6 border-b border-sky-50 pb-3">
          <h3 className="text-xl font-bold text-sky-900">
            {esModoEdicion ? 'Actualizar Perfil de Usuario' : 'Registrar Credenciales'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-colors font-bold text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
             <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Nombres *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Apellidos *</label>
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Cédula *</label>
            <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
          </div>
          
          <div className="grid grid-cols-2 gap-5">
             <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Usuario (Login) *</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={esModoEdicion} className={`w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm transition-shadow text-sky-900 ${esModoEdicion ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500'}`} />
            </div>
            
            {!esModoEdicion && (
              <div>
                <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Contraseña *</label>
                <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow text-sky-900" />
              </div>
            )}
          </div>

          <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 shadow-sm mt-2">
            <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">Nivel de Acceso *</label>
            <select
              value={rolId}
              onChange={(e) => setRolId(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-shadow"
            >
              <option value={0} disabled>Seleccione un rol...</option>
              {roles.map((rol: any) => {
                const rId = rol.id ?? rol.Id;
                const rNombre = rol.rolName ?? rol.RolName ?? rol.nombre ?? "Rol Desconocido";
                return (
                  <option key={rId} value={rId}>{rNombre}</option>
                );
              })}
            </select>
          </div>
          
          <AuditoriaFooter datosAuditales={usuarioExistente} />

          <div className="flex justify-end space-x-3 pt-5 border-t border-sky-50 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
              Cancelar
            </button>
            
            <div className="inline-block" title={!puedeGestionarUsuarios ? "No posees los privilegios necesarios para guardar perfiles de usuario." : ""}>
              <button 
                type="submit" 
                disabled={!puedeGestionarUsuarios}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all text-white ${!puedeGestionarUsuarios ? 'bg-slate-300 cursor-not-allowed shadow-none' : esModoEdicion ? 'bg-sky-500 hover:bg-sky-400 hover:-translate-y-0.5' : 'bg-emerald-500 hover:bg-emerald-400 hover:-translate-y-0.5'}`}
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