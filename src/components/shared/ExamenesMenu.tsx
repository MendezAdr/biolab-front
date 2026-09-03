import React, { useState, useEffect } from 'react';
import { examenesService } from '../../services/examenesService';
import { ModalExamen } from './ModalExamen';
import type { Examen } from '../../types/ExamenModel';
import type { ExamenCreateDTO } from '../../types/DTOs/ExamenCreateDTO';
import type { ExamenUpdateDTO } from '../../types/DTOs/ExamenUpdateDTO';

export function ExamenesMenu() {
  const [listaExamenes, setListaExamenes] = useState<Examen[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para controlar el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [examenAEditar, setExamenAEditar] = useState<Examen | null>(null);

  const currentUserId = 1; // ID del administrador para auditoría

  const cargarExamenes = async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await examenesService.getAll();
      setListaExamenes(respuesta || []);
    } catch (err) {
      console.error("Error al obtener exámenes:", err);
      setError("No pudimos conectar con el servidor para cargar el catálogo de exámenes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarExamenes();
  }, []);

  const abrirModalCrear = () => {
    setExamenAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (examen: Examen) => {
    setExamenAEditar(examen);
    setModalAbierto(true);
  };

  // Función para eliminar con advertencia irreversible
  const eliminarExamen = async (id: number, nombre: string) => {
    const confirmar = window.confirm(`⚠️ ADVERTENCIA IRREVERSIBLE\n\n¿Estás seguro que deseas eliminar el examen "${nombre}" del catálogo?\n\nEsta acción no se puede deshacer.`);
    
    if (confirmar) {
        try {
            await examenesService.delete(id, currentUserId);
            alert("Examen eliminado correctamente.");
            cargarExamenes(); // Refrescamos la tabla
        } catch(err) {
            alert("Error al eliminar el examen. Asegúrate de tener los permisos necesarios o verifica que el examen no esté asociado a facturas previas.");
        }
    }
  };

  const manejarGuardado = async (datos: ExamenCreateDTO | ExamenUpdateDTO) => {
    try {
      if (examenAEditar) {
        await examenesService.update(examenAEditar.Id, datos as ExamenUpdateDTO, currentUserId);
        alert("Examen actualizado correctamente.");
      } else {
        await examenesService.create(datos as ExamenCreateDTO, currentUserId);
        alert("Nuevo examen agregado al catálogo.");
      }
      setModalAbierto(false);
      cargarExamenes();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el examen en el sistema.");
    }
  };

  if (cargando) return <div className="p-10 text-center animate-pulse text-slate-500">Cargando catálogo de exámenes...</div>;
  
  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center max-w-2xl mx-auto mt-6">
      <p>{error}</p>
      <button onClick={cargarExamenes} className="mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 rounded-lg text-sm">Reintentar</button>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mx-auto max-w-5xl mt-6">
      
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-semibold text-emerald-800">Catálogo de Exámenes</h2>
          <p className="text-sm text-slate-500">Administra los servicios que ofrece el laboratorio</p>
        </div>
        <button 
          onClick={abrirModalCrear}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm"
        >
          + Agregar Examen
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 w-16 text-center">ID</th>
              <th className="p-4">Nombre del Examen</th>
              <th className="p-4">Descripción</th>
              <th className="p-4 text-right">Costo (USD)</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {listaExamenes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400">
                  El catálogo de exámenes está vacío.
                </td>
              </tr>
            ) : (
              listaExamenes.map((examen) => (
                <tr key={examen.Id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-slate-400 text-center">{examen.Id}</td>
                  <td className="p-4 font-semibold text-slate-800">{examen.NombreExamen}</td>
                  <td className="p-4 text-slate-500 truncate max-w-xs">{examen.Descripcion || 'Sin descripción'}</td>
                  <td className="p-4 font-bold text-emerald-600 text-right">${examen.CostoEnDivisa}</td>
                  <td className="p-4 text-center space-x-2">
                    <button 
                      onClick={() => abrirModalEditar(examen)} 
                      className="text-sky-600 hover:text-sky-800 font-medium text-xs bg-sky-50 px-3 py-1.5 rounded transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarExamen(examen.Id, examen.NombreExamen)} 
                      className="text-rose-600 hover:text-rose-800 font-medium text-xs bg-rose-50 px-3 py-1.5 rounded transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ModalExamen 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        onGuardar={manejarGuardado}
        examenExistente={examenAEditar}
      />
    </div>
  );
}