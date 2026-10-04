import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PermisosSistema, type RolCreateDTO, type RolUpdateDTO, type RolResponseDTO } from '../../types/DTOs/RolDTOS';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';
import { AuditoriaFooter } from './AuditoriaFooter';

interface ModalRolProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (datos: RolCreateDTO | RolUpdateDTO) => void; 
  rolExistente: RolResponseDTO | null; 
}

export function ModalRol({ isOpen, onClose, onGuardar, rolExistente }: ModalRolProps) {
  const { tienePermiso } = useAuth();
  const puedeGestionarRoles = tienePermiso(PERMISOS.GESTIONAR_USUARIOS);

  const [nombre, setNombre] = useState('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);

  const esModoEdicion = !!rolExistente;
  const permisosVisuales = PermisosSistema.filter(p => p.id !== 0 && p.id !== 511);

  useEffect(() => {
    if (isOpen) {
      if (esModoEdicion && rolExistente) {
        setNombre(rolExistente.rolName ?? '');
        setPermisosSeleccionados(rolExistente.permisos ?? []);
      } else {
        setNombre('');
        setPermisosSeleccionados([]);
      }
    }
  }, [isOpen, rolExistente, esModoEdicion]);

  if (!isOpen) return null;

  const togglePermiso = (id: number) => {
    if (!puedeGestionarRoles) return; 

    setPermisosSeleccionados(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) 
        : [...prev, id]              
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!nombre.trim()) {
      toast.error("El nombre del rol es obligatorio.");
      return;
    }

    if (permisosSeleccionados.length === 0) {
      toast.error("Debes asignar al menos un permiso al rol.");
      return;
    }

    if (esModoEdicion && rolExistente) {
      const rolActualizado: RolUpdateDTO = {
        id: rolExistente.id,
        nombre: nombre,
        permisos: permisosSeleccionados
      };
      onGuardar(rolActualizado);
    } else {
      const nuevoRol: RolCreateDTO = {
        nombre: nombre,
        permisos: permisosSeleccionados
      };
      onGuardar(nuevoRol);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-sky-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-2xl w-full p-7">
        
        <div className="flex justify-between items-center mb-6 border-b border-sky-50 pb-3">
          <h3 className="text-xl font-bold text-sky-900">
            {esModoEdicion ? 'Modificar Privilegios del Rol' : 'Definir Nuevo Rol'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-colors font-bold text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Nombre del Rol *</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              disabled={!puedeGestionarRoles}
              placeholder="Ej. Recepcionista, Auditor..."
              className={`w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow ${!puedeGestionarRoles ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-sky-900'}`} 
            />
          </div>

          <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 shadow-sm">
             <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-3 border-b border-sky-200 pb-2">
                Asignación de Privilegios (Granular)
             </label>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {permisosVisuales.map((permiso) => {
                   const estaMarcado = permisosSeleccionados.includes(permiso.id);
                   return (
                     <label 
                        key={permiso.id} 
                        className={`flex items-center p-3 rounded-xl border transition-all text-sm shadow-sm ${!puedeGestionarRoles ? 'cursor-not-allowed opacity-60 bg-slate-50 border-slate-200 text-slate-500 shadow-none' : estaMarcado ? 'bg-sky-100 border-sky-300 text-sky-900 cursor-pointer' : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-200 cursor-pointer'}`}
                     >
                       <input 
                          type="checkbox" 
                          disabled={!puedeGestionarRoles}
                          className={`w-5 h-5 bg-white border-2 rounded focus:ring-sky-500 mr-3 disabled:opacity-50 transition-colors ${estaMarcado ? 'text-sky-600 border-sky-600' : 'border-slate-300 text-slate-700'}`}
                          checked={estaMarcado}
                          onChange={() => togglePermiso(permiso.id)}
                       />
                       <span className="font-bold">{permiso.nombre}</span>
                     </label>
                   );
                })}
             </div>
          </div>

          <AuditoriaFooter datosAuditales={rolExistente} />
          
          <div className="flex justify-between items-center pt-5 border-t border-sky-50 mt-2">
            <span className="text-[11px] uppercase tracking-wider text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm">
               Privilegios seleccionados: {permisosSeleccionados.length}
            </span>
            <div className="space-x-3 flex">
               <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                 Cancelar
               </button>
               
               <div className="inline-block" title={!puedeGestionarRoles ? "Solo los administradores pueden guardar configuraciones de seguridad." : ""}>
                 <button 
                   type="submit" 
                   disabled={!puedeGestionarRoles}
                   className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all text-white ${!puedeGestionarRoles ? 'bg-slate-300 cursor-not-allowed shadow-none' : esModoEdicion ? 'bg-sky-500 hover:bg-sky-400 hover:-translate-y-0.5' : 'bg-emerald-500 hover:bg-emerald-400 hover:-translate-y-0.5'}`}
                 >
                   {esModoEdicion ? 'Guardar Cambios' : 'Crear Rol'}
                 </button>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}