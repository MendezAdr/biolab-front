import React, { useState, useEffect } from 'react';
import type { PacienteCreateDTO } from '../../types/DTOs/PacienteCreateDTO';
import type { PacienteUpdateDTO } from '../../types/DTOs/PacienteUpdateDTO';
import type { Paciente } from '../../types/PacienteModel';

interface ModalPacienteProps {
  isOpen: boolean;               
  onClose: () => void;           
  // Acepta ambos DTOs dependiendo de si estamos creando o editando
  onGuardar: (datos: PacienteCreateDTO | PacienteUpdateDTO) => void; 
  pacienteExistente: Paciente | null; 
}

export function ModalPaciente({ isOpen, onClose, onGuardar, pacienteExistente }: ModalPacienteProps) {
  
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F'>('M');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [nombreAcompanante, setNombreAcompanante] = useState('');
  const [cedulaAcompanante, setCedulaAcompanante] = useState('');

  const esModoEdicion = !!pacienteExistente;

  // Función segura para formatear la fecha del backend al formato YYYY-MM-DD que exige el <input type="date">
  const formatearFechaParaInput = (fecha: Date | string | undefined) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      if (esModoEdicion && pacienteExistente) {
        setNombre(pacienteExistente.Nombre);
        setApellido(pacienteExistente.Apellido);
        setCedula(pacienteExistente.Cedula);
        setSexo(pacienteExistente.Sexo);
        setTelefono(pacienteExistente.Telefono);
        setDireccion(pacienteExistente.Direccion);
        setFechaNacimiento(formatearFechaParaInput(pacienteExistente.FechaNacimiento));
        setNombreAcompanante(pacienteExistente.NombreAcompanante || '');
        setCedulaAcompanante(pacienteExistente.CedulaAcompanante || '');
      } else {
        // Limpiar si es creación
        setNombre(''); setApellido(''); setCedula(''); setSexo('M'); 
        setTelefono(''); setDireccion(''); setFechaNacimiento('');
        setNombreAcompanante(''); setCedulaAcompanante('');
      }
    }
  }, [isOpen, pacienteExistente, esModoEdicion]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!nombre || !apellido || !cedula || !telefono || !direccion) {
      alert("Por favor, rellena todos los campos obligatorios (*).");
      return;
    }

    if (esModoEdicion && pacienteExistente) {
        const pacienteActualizado: PacienteUpdateDTO = {
            Id: pacienteExistente.Id,
            Nombre: nombre,
            Apellido: apellido,
            Cedula: cedula,
            Sexo: sexo,
            Telefono: telefono,
            Direccion: direccion,
            ...(nombreAcompanante && { NombreAcompanante: nombreAcompanante }),
            ...(cedulaAcompanante && { CedulaAcompanante: cedulaAcompanante }),
            ...(fechaNacimiento && { FechaNacimiento: new Date(fechaNacimiento) })
        };
        onGuardar(pacienteActualizado);
    } else {
        const pacienteCreado: PacienteCreateDTO = {
            Nombre: nombre,
            Apellido: apellido,
            Cedula: cedula,
            Sexo: sexo,
            Telefono: telefono,
            Direccion: direccion,
            ...(nombreAcompanante && { NombreAcompanante: nombreAcompanante }),
            ...(cedulaAcompanante && { CedulaAcompanante: cedulaAcompanante }),
            ...(fechaNacimiento && { FechaNacimiento: new Date(fechaNacimiento) })
        };
        onGuardar(pacienteCreado); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h3 className="text-lg font-bold text-slate-800">
            {esModoEdicion ? 'Actualizar Ficha del Paciente' : 'Registrar Nuevo Paciente'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Fila 1: Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombres *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Apellidos *</label>
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" />
            </div>
          </div>

          {/* Fila 2: Cédula y Sexo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cédula *</label>
              <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sexo *</label>
              <select value={sexo} onChange={(e) => setSexo(e.target.value as 'M' | 'F')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none">
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Teléfono y Fecha de Nacimiento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Teléfono *</label>
              <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha de Nacimiento</label>
              <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" />
            </div>
          </div>

          {/* Fila 4: Dirección */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dirección *</label>
            <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" />
          </div>

          <hr className="border-slate-100 my-4" />
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Información del Acompañante (Opcional)</h4>

          {/* Fila 5: Acompañante */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre Completo</label>
              <input type="text" value={nombreAcompanante} onChange={(e) => setNombreAcompanante(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cédula</label>
              <input type="text" value={cedulaAcompanante} onChange={(e) => setCedulaAcompanante(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${esModoEdicion ? 'bg-sky-600 hover:bg-sky-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {esModoEdicion ? 'Guardar Cambios' : 'Registrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}