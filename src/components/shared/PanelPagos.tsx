import React, { useState, useEffect } from 'react';
import { pagosService } from '../../services/pagosService';
import { ModalRegistroPago } from './ModalRegistroPagos';
import type { PagoStandaloneCreateDTO } from '../../types/DTOs/PagoStandaloneCreateDTO';
import type { PagoUpdateDTO } from '../../types/DTOs/PagoUpdateDTO';
import { PagoMetodo, type Pago } from '../../types/PagoModel';

// 1. IMPORTAMOS EL CONTEXTO Y LOS PERMISOS
import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function PanelPagos() {
  // 2. EXTRAEMOS LA SESIÓN ACTUAL
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 

  // Evaluamos el permiso
  const puedeGestionarPagos = tienePermiso(PERMISOS.GESTIONAR_PAGOS);

  const [listaPagos, setListaPagos] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pagoAEditar, setPagoAEditar] = useState<Pago | null>(null);

  const cargarPagos = async () => {
    try {
      setCargando(true);
      setError(null);
      const respuesta = await pagosService.getByFechas();
      setListaPagos(respuesta || []);
    } catch (err) {
      console.error("Error al obtener pagos:", err);
      setError("No pudimos conectar con el servidor para cargar el historial de pagos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  const abrirModalCrear = () => {
    setPagoAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (pago: Pago) => {
    setPagoAEditar(pago);
    setModalAbierto(true);
  };

  const anularPago = async (id: number) => {
    if(window.confirm("¿Estás seguro de anular este pago? Esta acción es irreversible y afectará la caja.")){
        try {
            await pagosService.delete(id, currentUserId);
            alert("Pago anulado correctamente.");
            cargarPagos();
        } catch(err) {
            alert("Error al anular el pago. Verifica tus permisos.");
        }
    }
  };

  const manejarGuardado = async (datos: PagoStandaloneCreateDTO | PagoUpdateDTO) => {
    try {
      if (pagoAEditar) {
        await pagosService.update(pagoAEditar.Id, datos as PagoUpdateDTO, currentUserId);
        alert("Pago corregido exitosamente.");
      } else {
        await pagosService.createAddPago(datos as PagoStandaloneCreateDTO, currentUserId);
        alert("Abono registrado exitosamente.");
      }
      setModalAbierto(false);
      cargarPagos();
    } catch (err) {
      console.error(err);
      alert("Error al procesar el pago.");
    }
  };

  if (cargando) return <div className="p-10 text-center animate-pulse text-slate-500">Cargando módulo de caja...</div>;
  
  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center max-w-2xl mx-auto">
      <p>{error}</p>
      <button onClick={cargarPagos} className="mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 rounded-lg text-sm">Reintentar</button>
    </div>
  );

  return (
    <div className="space-y-6 p-2 max-w-6xl mx-auto">
      
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Control de Caja y Abonos</h2>
          <p className="text-sm text-slate-500">Auditoría de pagos, correcciones y recepción de deudas</p>
        </div>

        {/* BOTÓN PROTEGIDO: Registrar Abono */}
        <div className="inline-block" title={!puedeGestionarPagos ? "Tu rol no tiene permiso para registrar pagos en caja." : ""}>
          <button 
            onClick={abrirModalCrear}
            disabled={!puedeGestionarPagos}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm ${!puedeGestionarPagos ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
          >
            + Registrar Abono Manual
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">ID Pago</th>
                <th className="p-4">Orden (Factura)</th>
                <th className="p-4">Método</th>
                <th className="p-4">Referencia</th>
                <th className="p-4 text-right">Monto (USD)</th>
                <th className="p-4 text-center">Acciones (Admin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {listaPagos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No hay registros de pagos recientes.
                  </td>
                </tr>
              ) : (
                listaPagos.map((pago) => {
                  const nombreMetodo = PagoMetodo.find(m => m.id === pago.Metodo)?.metodo || 'Desconocido';

                  return (
                    <tr key={pago.Id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-slate-500">#{pago.Id}</td>
                      <td className="p-4 font-semibold text-emerald-700">ORD-{pago.OrdenId}</td>
                      <td className="p-4">
                        <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded text-xs font-medium border border-sky-100">
                          {nombreMetodo}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{pago.Referencia || 'N/A'}</td>
                      <td className="p-4 font-bold text-slate-800 text-right">${pago.Monto}</td>
                      <td className="p-4 text-center space-x-2">
                        
                        {/* BOTÓN PROTEGIDO: Corregir */}
                        <div className="inline-block" title={!puedeGestionarPagos ? "Sin permisos para corregir pagos." : ""}>
                          <button 
                            onClick={() => abrirModalEditar(pago)} 
                            disabled={!puedeGestionarPagos}
                            className={`font-medium text-xs px-2 py-1 rounded transition-colors ${!puedeGestionarPagos ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-amber-600 hover:text-amber-800 bg-amber-50'}`}
                          >
                            Corregir
                          </button>
                        </div>

                        {/* BOTÓN PROTEGIDO: Anular */}
                        <div className="inline-block" title={!puedeGestionarPagos ? "Sin permisos para anular pagos." : ""}>
                          <button 
                            onClick={() => anularPago(pago.Id)} 
                            disabled={!puedeGestionarPagos}
                            className={`font-medium text-xs px-2 py-1 rounded transition-colors ${!puedeGestionarPagos ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-rose-600 hover:text-rose-800 bg-rose-50'}`}
                          >
                            Anular
                          </button>
                        </div>

                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalRegistroPago 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        onGuardar={manejarGuardado}
        pagoExistente={pagoAEditar}
      />
      
    </div>
  );
}