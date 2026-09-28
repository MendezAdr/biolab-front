import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // Notificaciones asíncronas
import { pagosService } from '../../services/pagosService';
import { ModalRegistroPago } from './ModalRegistroPagos';
import type { PagoStandaloneCreateDTO } from '../../types/DTOs/PagoStandaloneCreateDTO';
import type { PagoUpdateDTO } from '../../types/DTOs/PagoUpdateDTO';
import { PagoMetodo, type Pago } from '../../types/PagoModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function PanelPagos() {
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 

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
    // PREVENCIÓN: Solo llamamos al backend si el usuario tiene permiso
    if (puedeGestionarPagos) {
      cargarPagos();
    } else {
      setCargando(false);
    }
  }, [puedeGestionarPagos]);

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
            toast.success("Pago anulado y retirado de la caja correctamente.");
            cargarPagos();
        } catch(err: any) {
            toast.error(err.message || "Error al anular el pago. Verifica tus permisos.");
        }
    }
  };

  // SISTEMA DE PROMESA: Feedback en tiempo real
  const manejarGuardado = async (datos: PagoStandaloneCreateDTO | PagoUpdateDTO) => {
    toast.promise(
      (async () => {
        if (pagoAEditar) {
          const pagoId = pagoAEditar.id ?? (pagoAEditar as any).Id;
          await pagosService.update(pagoId, datos as PagoUpdateDTO, currentUserId);
        } else {
          await pagosService.createAddPago(datos as PagoStandaloneCreateDTO, currentUserId);
        }
        setModalAbierto(false);
        await cargarPagos();
      })(),
      {
        loading: 'Procesando transacción...',
        success: '¡Caja actualizada con éxito!',
        error: (err) => err.message || 'Error al procesar el pago.',
      }
    );
  };

  // PANTALLA DE RESTRICCIÓN DE ACCESO
  if (!puedeGestionarPagos) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-xl shadow-sm mx-auto max-w-2xl mt-12 text-center">
        <span className="text-6xl mb-4 opacity-80">🔒</span>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
        <p className="text-slate-500">
          Tu nivel de acceso actual no te permite auditar la caja, registrar ni corregir pagos en el sistema.
        </p>
      </div>
    );
  }

  if (cargando) return <div className="p-10 text-center animate-pulse text-slate-500">Cargando módulo de caja...</div>;
  
  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center max-w-2xl mx-auto">
      <p className="font-semibold">{error}</p>
      <button onClick={cargarPagos} className="mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 rounded-lg text-sm transition-colors">Reintentar</button>
    </div>
  );

  return (
    <div className="space-y-6 p-2 max-w-6xl mx-auto">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Control de Caja y Abonos</h2>
          <p className="text-sm text-slate-500">Auditoría de pagos, correcciones y recepción de deudas</p>
        </div>

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
                  // EXTRACCIÓN SEGURA (camelCase con contingencia)
                  const id = pago.id ?? (pago as any).Id;
                  const ordenId = pago.ordenId ?? (pago as any).OrdenId;
                  const metodo = pago.metodo ?? (pago as any).Metodo;
                  const referencia = pago.referencia ?? (pago as any).Referencia;
                  const monto = pago.monto ?? (pago as any).Monto;

                  const nombreMetodo = PagoMetodo.find(m => m.id === metodo)?.metodo || 'Desconocido';

                  return (
                    <tr key={id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-slate-500">#{id}</td>
                      <td className="p-4 font-semibold text-emerald-700">ORD-{ordenId}</td>
                      <td className="p-4">
                        <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded text-xs font-medium border border-sky-100">
                          {nombreMetodo}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{referencia || 'N/A'}</td>
                      <td className="p-4 font-bold text-slate-800 text-right">${monto}</td>
                      <td className="p-4 text-center space-x-2">
                        
                        <div className="inline-block" title={!puedeGestionarPagos ? "Sin permisos para corregir pagos." : ""}>
                          <button 
                            onClick={() => abrirModalEditar(pago)} 
                            disabled={!puedeGestionarPagos}
                            className={`font-medium text-xs px-2 py-1 rounded transition-colors ${!puedeGestionarPagos ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-amber-600 hover:text-amber-800 bg-amber-50'}`}
                          >
                            Corregir
                          </button>
                        </div>

                        <div className="inline-block" title={!puedeGestionarPagos ? "Sin permisos para anular pagos." : ""}>
                          <button 
                            onClick={() => anularPago(id)} 
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