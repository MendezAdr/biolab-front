import React, { useState, useEffect } from 'react';
import type { PacienteCreateDTO } from '../../types/DTOs/PacienteCreateDTO';

interface ModalNuevoPacienteProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (nuevo: PacienteCreateDTO) => void; 
}

export function ModalNuevoPaciente({ isOpen, onClose, onGuardar }: ModalNuevoPacienteProps) {
  // Estados para los campos obligatorios
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cedula, setCedula] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F'>('M');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  // Estados para los campos opcionales
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [nombreAcompanante, setNombreAcompanante] = useState('');
  const [cedulaAcompanante, setCedulaAcompanante] = useState('');

  // Reiniciar formulario al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setNombre(''); setApellido(''); setCedula(''); setSexo('M'); 
      setTelefono(''); setDireccion(''); setFechaNacimiento('');
      setNombreAcompanante(''); setCedulaAcompanante('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    // Validación básica de campos obligatorios según tu DTO
    if (!nombre || !apellido || !cedula || !telefono || !direccion) {
      alert("Por favor, rellena todos los campos obligatorios (*).");
      return;
    }

    // Construimos el DTO
    const pacienteCreado: PacienteCreateDTO = {
      Nombre: nombre,
      Apellido: apellido,
      Cedula: cedula,
      Sexo: sexo,
      Telefono: telefono,
      Direccion: direccion,
      // Los opcionales solo se envían si tienen valor
      ...(nombreAcompanante && { NombreAcompanante: nombreAcompanante }),
      ...(cedulaAcompanante && { CedulaAcompanante: cedulaAcompanante }),
      // Convertimos el string del input date a un objeto Date (o ISO string) si es necesario
      ...(fechaNacimiento && { FechaNacimiento: new Date(fechaNacimiento) })
    };

    onGuardar(pacienteCreado); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Registrar Nuevo Paciente</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fila 1: Nombres */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombres *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Apellidos *</label>
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
          </div>

          {/* Fila 2: Cédula y Sexo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cédula *</label>
              <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sexo *</label>
              <select value={sexo} onChange={(e) => setSexo(e.target.value as 'M' | 'F')} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none">
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Teléfono y Fecha Nacimiento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Teléfono *</label>
              <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha de Nacimiento</label>
              <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
          </div>

          {/* Fila 4: Dirección Completa */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dirección *</label>
            <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
          </div>

          <hr className="border-slate-100 my-4" />
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Información del Acompañante (Opcional)</h4>

          {/* Fila 5: Acompañante */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre Completo</label>
              <input type="text" value={nombreAcompanante} onChange={(e) => setNombreAcompanante(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cédula</label>
              <input type="text" value={cedulaAcompanante} onChange={(e) => setCedulaAcompanante(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50" />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm">
              Guardar Paciente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}