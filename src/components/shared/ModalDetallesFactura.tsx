import React, { useState, useEffect } from 'react';
import { ordenesService } from '../../services/ordenesService';
import type { Orden } from '../../types/OrdenesModel';
import { PagoMetodo, type Pago } from '../../types/PagoModel';

interface ModalDetallesFacturaProps {
  ordenId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalDetallesFactura({ ordenId, isOpen, onClose }: ModalDetallesFacturaProps) {
  const [ordenDetalle, setOrdenDetalle] = useState<Orden | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = 1; // Simulación del ID del usuario activo

  useEffect(() => {
    // Si el modal se abre y tenemos un ID válido, buscamos los detalles en el backend
    if (isOpen && ordenId) {
      const cargarDetalles = async () => {
        try {
          setCargando(true);
          setError(null);
          // Llamamos a tu endpoint [HttpGet("{id}")]
          const data = await ordenesService.getById(ordenId, currentUserId);
          setOrdenDetalle(data);
        } catch (err) {
          console.error("Error al cargar detalles de la factura:", err);
          setError("No se pudieron cargar los detalles de esta factura.");
        } finally {
          setCargando(false);
        }
      };
      cargarDetalles();
    } else {
      // Limpiamos al cerrar
      setOrdenDetalle(null);
    }
  }, [isOpen, ordenId]);


  // FUNCIÓN BLINDADA PARA FECHAS CON HORA
  const formatearFechaYHoraSegura = (fechaString: any) => {
    if (!fechaString) return 'No disponible';
    const fechaObj = new Date(fechaString);
    return isNaN(fechaObj.getTime()) ? 'Inválida' : fechaObj.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            Detalles de la Factura {ordenDetalle ? `#${ordenDetalle.NumeroFactura}` : ''}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1 text-xl">✕</button>
        </div>

        {cargando ? (
          <div className="flex justify-center items-center h-40 text-slate-500">Cargando información completa...</div>
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 text-center rounded-lg">{error}</div>
        ) : ordenDetalle ? (
          <div className="space-y-6">
            
            {/* Sección 1: Información General */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Paciente (ID)</p>
                <p className="font-medium text-slate-800">{ordenDetalle.PacienteId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Fecha de Emisión</p>
                <p className="font-medium text-slate-800">{formatearFechaYHoraSegura(ordenDetalle.FechaCreacion)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Tasa BCV Aplicada</p>
                <p className="font-medium text-slate-800">Bs. {ordenDetalle.TasaBcv}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Total a Pagar (USD)</p>
                <p className="font-bold text-emerald-700 text-lg">${ordenDetalle.TotalDivisa}</p>
              </div>
            </div>

            {/* Sección 2: Lista de Exámenes (Detalles) */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-2 border-b pb-1">Exámenes Solicitados</h4>
              {ordenDetalle.Detalles && ordenDetalle.Detalles.length > 0 ? (
                <ul className="space-y-2">
                  {ordenDetalle.Detalles.map((det: any, index: number) => (
                    <li key={index} className="flex justify-between text-sm p-2 bg-white border text-slate-700 border-slate-100 rounded">
                      <span>Nombre Examen: {det.ExamenNombre}</span>
                      <span className="font-medium">${det.PrecioMomentoDivisa}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No hay exámenes registrados.</p>
              )}
            </div>

            {/* Sección 3: Historial de Pagos */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-2 border-b pb-1">Registro de Pagos</h4>
              {ordenDetalle.Pagos && ordenDetalle.Pagos.length > 0 ? (
                <ul className="space-y-2">
                  {ordenDetalle.Pagos.map((pago: Pago, index: number) => {
                    // BUSCAMOS EL NOMBRE DEL MÉTODO EN EL DICCIONARIO
                    const metodoEncontrado = PagoMetodo.find(m => m.id === pago.Metodo);
                    const nombreMetodo = metodoEncontrado ? metodoEncontrado.metodo : 'Desconocido';

                    return (
                      <li key={index} className="flex justify-between text-sm p-2 text-slate-700 bg-white border border-slate-100 rounded">
                        <span>Método: {nombreMetodo} <span className="text-xs text-slate-500">(Ref: {pago.Referencia || 'N/A'})</span></span>
                        <span className="font-medium">${pago.Monto}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Orden pendiente de pago.</p>
              )}
            </div>

            {/* Botón de Impresión de la vista */}
            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => alert('Módulo de impresión de comprobantes en desarrollo')}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <span>🖨️</span> Imprimir Copia
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}