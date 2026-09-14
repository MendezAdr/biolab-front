import React, { useState, useEffect } from 'react';
import { PermisosSistema, type RolCreateDTO, type RolUpdateDTO, type RolResponseDTO } from '../../types/DTOs/RolDTOS';

interface ModalRolProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (datos: RolCreateDTO | RolUpdateDTO) => void; 
  rolExistente: RolResponseDTO | null; 
}

export function ModalRol({ isOpen, onClose, onGuardar, rolExistente }: ModalRolProps) {
  const [nombre, setNombre] = useState('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);

  const esModoEdicion = !!rolExistente;

  // Filtramos "Ninguno (0)" y "Todos (511)" para evitar confusión visual,
  // permitiendo al usuario armar los roles chequeando las casillas individuales.
  const permisosVisuales = PermisosSistema.filter(p => p.id !== 0 && p.id !== 511);

  useEffect(() => {
    if (isOpen) {
      if (esModoEdicion && rolExistente) {
        setNombre(rolExistente.RolName);
        setPermisosSeleccionados(rolExistente.Permisos);
      } else {
        setNombre('');
        setPermisosSeleccionados([]);
      }
    }
  }, [isOpen, rolExistente, esModoEdicion]);

  if (!isOpen) return null;

  // Manejador dinámico para las casillas de verificación
  const togglePermiso = (id: number) => {
    setPermisosSeleccionados(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id) // Si ya lo tiene, lo quitamos
        : [...prev, id]              // Si no lo tiene, lo agregamos
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!nombre.trim()) {
      alert("El nombre del rol es obligatorio.");
      return;
    }

    if (permisosSeleccionados.length === 0) {
      alert("Debes asignar al menos un permiso al rol.");
      return;
    }

    if (esModoEdicion && rolExistente) {
      const rolActualizado: RolUpdateDTO = {
        Id: rolExistente.Id,
        Nombre: nombre,
        Permisos: permisosSeleccionados
      };
      onGuardar(rolActualizado);
    } else {
      const nuevoRol: RolCreateDTO = {
        Nombre: nombre,
        Permisos: permisosSeleccionados
      };
      onGuardar(nuevoRol);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6">
        
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h3 className="text-lg font-bold text-slate-800">
            {esModoEdicion ? 'Modificar Privilegios del Rol' : 'Definir Nuevo Rol'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre del Rol *</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Ej. Recepcionista, Auditor..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-700 focus:outline-none focus:border-emerald-500" 
            />
          </div>

          <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-3 border-b pb-1">
                Asignación de Privilegios (Granular)
             </label>
             
             {/* Cuadrícula de Checkboxes */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2">
                {permisosVisuales.map((permiso) => {
                   const estaMarcado = permisosSeleccionados.includes(permiso.id);
                   return (
                     <label 
                        key={permiso.id} 
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors text-sm ${estaMarcado ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                     >
                       <input 
                          type="checkbox" 
                          className="w-4 h-4 text-emerald-600 bg-white border-slate-300 rounded focus:ring-emerald-500 mr-3"
                          checked={estaMarcado}
                          onChange={() => togglePermiso(permiso.id)}
                       />
                       <span className="font-medium">{permiso.nombre}</span>
                     </label>
                   );
                })}
             </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
               Privilegios seleccionados: {permisosSeleccionados.length}
            </span>
            <div className="space-x-3">
               <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">
                 Cancelar
               </button>
               <button type="submit" className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${esModoEdicion ? 'bg-sky-600 hover:bg-sky-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                 {esModoEdicion ? 'Guardar Cambios' : 'Crear Rol'}
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}