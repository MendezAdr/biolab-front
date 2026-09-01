import React, { useState, useEffect } from 'react';
import { pacienteService } from '../../services/pacienteService';
import type { PacienteCreateDTO } from '../../types/DTOs/PacienteCreateDTO';
import { ModalNuevoPaciente } from './ModalNuevoPaciente';

export function TablaPacientes() {
  const [listaPacientes, setListaPacientes] = useState<any[]>([]); 
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Simulación del ID del usuario activo
  const currentUserId = 1; 

  const cargarPacientes = async () => {
    try {
      setCargando(true);
      setError(null); 
      
      // Llamamos al servicio (getAll no requería el ID de usuario en tu controlador actual)
      const respuesta = await pacienteService.getAll();
      setListaPacientes(respuesta || []); 
      
    } catch (err) {
      console.error("Error al obtener pacientes:", err);
      setError("No pudimos conectar con el servidor local para cargar el registro de pacientes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const manejarGuardarPaciente = async (nuevoPacienteDTO: PacienteCreateDTO) => {
    try {
      await pacienteService.create(nuevoPacienteDTO, currentUserId);
      setModalAbierto(false);
      cargarPacientes(); // Refrescamos la tabla
    } catch (err: any) {
      console.error("Error al crear paciente:", err);
      alert("Ocurrió un error al intentar registrar el paciente. Verifica la conexión o si la cédula ya existe.");
    }
  };

  function Detalles() {
    alert('Función de detalles de paciente (Historial) aún no implementada');
  }

  // --- REDES DE SEGURIDAD ---

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
        <span className="animate-pulse">Cargando base de datos de pacientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center mx-auto max-w-2xl mt-8">
        <p className="font-semibold text-lg mb-2">Error de Conexión</p>
        <p className="text-sm mb-4">{error}</p>
        <button 
          onClick={cargarPacientes} 
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
          <h2 className="text-lg font-semibold text-sky-700">Lista de Pacientes</h2>
          <p className="text-sm text-slate-500">Registro histórico general del laboratorio</p>
        </div>
        <button 
          onClick={() => setModalAbierto(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Nuevo Paciente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="p-4">Paciente</th>
              <th className="p-4">Cédula</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Sexo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {listaPacientes.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400">
                  <p>No hay pacientes registrados en el sistema actualmente.</p>
                </td>
              </tr>
            ) : (
              listaPacientes.map((paciente) => (
                <tr key={paciente.id} onClick={Detalles} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{paciente.nombre} {paciente.apellido}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-600">{paciente.cedula}</td>
                  <td className="p-4 text-slate-600">{paciente.telefono}</td>
                  <td className="p-4">
                    <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded text-xs font-medium border border-sky-100">
                      {paciente.sexo}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <ModalNuevoPaciente 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          onGuardar={manejarGuardarPaciente}
        />  
      </div>
    </div>
  );
}