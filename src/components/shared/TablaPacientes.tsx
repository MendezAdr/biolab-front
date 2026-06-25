import React from 'react';

import type { Paciente } from '../../types/Pacientes';
import { ModalNuevoPaciente } from './ModalNuevoPaciente';

export function TablaPacientes() {
  
  /* ========================================================================
    ZONA DE BACKEND / LOGICA (Futuro)
    Aquí llamarás a tus métodos de C# / API .NET para rellenar la tabla.
    Por ahora, dejamos esta lista "quemada" directamente para maquetar lo visual.
    ========================================================================
  */

    const [listaPacientes, setListaPacientes] = React.useState<Paciente[]>([
      { id: 1, nombre: 'Charles John', cedula: 'V-15.421.054', estado: 'Pendiente', fecha: '12/12/2023' },
      { id: 2, nombre: 'Dianne Rusell', cedula: 'V-20.114.852', estado: 'Completado', fecha: '10/08/2023' },
      { id: 3, nombre: 'Anette Black', cedula: 'V-18.963.147', estado: 'Completado', fecha: '10/08/2023' },
    ]);
  
    const[modalAbierto, setModalAbierto] = React.useState(false);

    function manejarGuardarPaciente(pacienteNuevo: Paciente) {
      setListaPacientes([pacienteNuevo, ...listaPacientes]);
    }

    const pacientesById = [...listaPacientes].sort(
      (b, a) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    function Detalles() {
    alert('Función de detalles aún no implementada');
    }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-5xl">
      {/* Encabezado de la Tarjeta */}
      <div className="p-5 border-b border-emerald-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-sky-700">Lista de Pacientes</h2>
          <p className="text-sm text-slate-500">Exámenes registrados recientemente</p>
        </div>
        <button 
        onClick={() => setModalAbierto(true)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nuevo Paciente
        </button>
      </div>

      {/* Tabla HTML con Tailwind */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-300/50 text-slate-600 text-xs font-semibold uppercase tracking-wider  border-emerald-800">
              <th className="p-4">Paciente</th>
              <th className="p-4">Cédula</th>
              <th className="p-4">Fecha Ingreso</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-800/40 text-sm text-emerald-300">
            {pacientesById.map((paciente) => (
              <tr key={paciente.id} onClick={Detalles} className="hover:bg-emerald-200/30 transition-colors cursor-pointer">
                <td className="p-4 font-medium text-emerald-700 hover:text-emerald-950">{paciente.nombre}</td>
                <td className="p-4 text-slate-700">{paciente.cedula}</td>
                <td className="p-4 text-slate-700">{paciente.fecha}</td>
                <td className="p-4">
                  {/* Etiqueta dinámica de colores según el estado */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    paciente.estado === 'Completado' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {paciente.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
            {/* ========================================================================
                3. INYECTAMOS EL COMPONENTE MODAL EN LA BASE DEL DOCUMENTO
                Le pasamos el estado actual (isOpen), y las funciones para reaccionar.
                ========================================================================
            */}
            <ModalNuevoPaciente 
              isOpen={modalAbierto} 
              onClose={() => setModalAbierto(false)} 
              onGuardar={manejarGuardarPaciente}
            />  
        </div>
      </div>
    </div>
  );
}