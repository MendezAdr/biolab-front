import React, { useState, useEffect } from 'react';
import { pacienteService } from '../../services/pacienteService';
import type { PacienteCreateDTO } from '../../types/DTOs/PacienteCreateDTO';
import type { PacienteUpdateDTO } from '../../types/DTOs/PacienteUpdateDTO';
import { ModalPaciente } from './ModalPaciente';
import type { Paciente } from '../../types/PacienteModel';

export function TablaPacientes() {
  const [listaPacientes, setListaPacientes] = useState<Paciente[]>([]); 
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el Modal Multipropósito
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pacienteAEditar, setPacienteAEditar] = useState<Paciente | null>(null);

  const currentUserId = 1; 

  const cargarPacientes = async () => {
    try {
      setCargando(true);
      setError(null); 
      const respuesta = await pacienteService.getAll();
      setListaPacientes(respuesta || []); 
    } catch (err) {
      setError("No pudimos conectar con el servidor local para cargar el registro de pacientes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const abrirModalCrear = () => {
    setPacienteAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (paciente: Paciente) => {
    setPacienteAEditar(paciente);
    setModalAbierto(true);
  };

  // Función para desactivar (borrado lógico)
  const desactivarPaciente = async (id: number, nombre: string) => {
    if(window.confirm(`¿Estás seguro de que deseas desactivar el registro de ${nombre}?`)) {
      try {
        await pacienteService.deactivate(id, currentUserId);
        alert("Paciente desactivado del sistema.");
        cargarPacientes();
      } catch (err) {
        alert("Error al intentar desactivar el paciente.");
      }
    }
  };

  // Manejador central que discrimina entre crear y actualizar
  const manejarGuardado = async (datos: PacienteCreateDTO | PacienteUpdateDTO) => {
    try {
      if ('Id' in datos) {
        // Si el objeto tiene Id, es un UpdateDTO
        await pacienteService.update(datos.Id, datos as PacienteUpdateDTO, currentUserId);
        alert("Ficha de paciente actualizada correctamente.");
      } else {
        // Si no tiene Id, es un CreateDTO
        await pacienteService.create(datos as PacienteCreateDTO, currentUserId);
        alert("Paciente registrado con éxito.");
      }
      setModalAbierto(false);
      cargarPacientes(); 
    } catch (err: any) {
      console.error("Error al procesar paciente:", err);
      alert("Ocurrió un error al intentar procesar la solicitud. Verifica la conexión o si la cédula ya existe.");
    }
  };

  if (cargando) return <div className="flex justify-center items-center h-64 text-slate-500">Cargando base de datos...</div>;
  if (error) return <div className="p-6 text-rose-700 text-center">{error}</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-5xl">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-sky-700">Lista de Pacientes</h2>
          <p className="text-sm text-slate-500">Registro histórico general del laboratorio</p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          + Nuevo Paciente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="p-4">Paciente</th>
              <th className="p-4">Cédula</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Sexo</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {listaPacientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  <p>No hay pacientes registrados en el sistema actualmente.</p>
                </td>
              </tr>
            ) : (
              listaPacientes.map((paciente) => (
                <tr key={paciente.Id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{paciente.Nombre} {paciente.Apellido}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-600">{paciente.Cedula}</td>
                  <td className="p-4 text-slate-600">{paciente.Telefono}</td>
                  <td className="p-4">
                    <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded text-xs font-medium border border-sky-100">
                      {paciente.Sexo}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button 
                      onClick={() => abrirModalEditar(paciente)}
                      className="text-sky-600 hover:text-sky-800 font-medium text-xs bg-sky-50 px-3 py-1.5 rounded transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => desactivarPaciente(paciente.Id, paciente.Nombre)}
                      className="text-rose-600 hover:text-rose-800 font-medium text-xs bg-rose-50 px-3 py-1.5 rounded transition-colors"
                    >
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <ModalPaciente 
          isOpen={modalAbierto} 
          onClose={() => setModalAbierto(false)} 
          onGuardar={manejarGuardado}
          pacienteExistente={pacienteAEditar}
        />  
      </div>
    </div>
  );
}