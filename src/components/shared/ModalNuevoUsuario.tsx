import React, { useState, useEffect } from 'react';
import type { UsuarioCreateDTO } from '../../types/DTOs/UsuarioCreateDTO';
import type { Rol } from '../../types/DTOs/RolUsuarioEnum'; 

interface ModalNuevoUsuarioProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (nuevoDTO: UsuarioCreateDTO) => void; 
  roles: Rol[]; 
}

export function ModalNuevoUsuario({ isOpen, onClose, onGuardar, roles }: ModalNuevoUsuarioProps) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [username, setUsername] = useState('');
  const [contrasena, setContrasena] = useState('');
  
  // Manejamos el rol estrictamente como número. 0 = Ningún rol seleccionado.
  const [rolId, setRolId] = useState<number>(0); 

  useEffect(() => {
    if (isOpen) {
      setNombre(''); setApellido(''); setCedula(''); setUsername(''); setContrasena('');
      setRolId(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!nombre || !apellido || !cedula || !username || !contrasena) {
      alert("Por favor, rellena todos los campos obligatorios.");
      return;
    }

    if (rolId === 0) {
      alert("Por favor, selecciona un nivel de acceso (Rol) válido.");
      return;
    }

    const usuarioCreado: UsuarioCreateDTO = {
      Username: username,
      Nombre: nombre,
      Apellido: apellido,
      Cedula: cedula,
      Contrasena: contrasena,
      RolId: rolId, 
    };

    onGuardar(usuarioCreado); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6">
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Registrar Credenciales</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Apellido</label>
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cédula</label>
            <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Usuario (Login)</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contraseña</label>
              <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nivel de Acceso</label>
            <select
              value={rolId}
              onChange={(e) => setRolId(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:border-emerald-500 focus:outline-none"
            >
              <option value={0} disabled>Seleccione un rol...</option>
              
              {/* Iteramos sobre los roles inyectados por el componente padre */}
              {roles.map((rol) => (
                <option key={rol.Id} value={rol.Id}>
                  {rol.Name}
                </option>
              ))}
              
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">
              Guardar Credenciales
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}