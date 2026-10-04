import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast'; // Reemplazo de alerts por Toasts
import { ordenesService } from '../../services/ordenesService'; 
import type { PagoStandaloneCreateDTO } from '../../types/DTOs/PagoStandaloneCreateDTO';
import type { PagoUpdateDTO } from '../../types/DTOs/PagoUpdateDTO';
import type { Orden } from '../../types/OrdenesModel'; 

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';
import { AuditoriaFooter } from './AuditoriaFooter';

interface ModalRegistroPagoProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (datos: PagoStandaloneCreateDTO | PagoUpdateDTO) => void; 
  pagoExistente: any | null; 
}

export function ModalRegistroPago({ isOpen, onClose, onGuardar, pagoExistente }: ModalRegistroPagoProps) {
  const { usuario, tienePermiso } = useAuth();
  const currentUserId = usuario?.id || 1; 
  const puedeGestionarPagos = tienePermiso(PERMISOS.GESTIONAR_PAGOS);

  const [ordenId, setOrdenId] = useState<number | ''>('');
  const [monto, setMonto] = useState<string>('');
  const [metodo, setMetodo] = useState<number>(1); 
  const [referencia, setReferencia] = useState('');

  const [busquedaOrden, setBusquedaOrden] = useState('');
  const [ordenesActivasBD, setOrdenesActivasBD] = useState<Orden[]>([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);

  const esModoEdicion = !!pagoExistente;

  useEffect(() => {
    if (isOpen) {
      if (esModoEdicion) {
        // EXTRACCIÓN camelCase
        const oId = pagoExistente.ordenId ?? pagoExistente.OrdenId;
        const m = pagoExistente.monto ?? pagoExistente.Monto;
        const met = pagoExistente.metodo ?? pagoExistente.Metodo;
        const ref = pagoExistente.referencia ?? pagoExistente.Referencia ?? '';

        setOrdenId(oId);
        setBusquedaOrden(`ORD-${oId}`); 
        setMonto(m.toString());
        setMetodo(met);
        setReferencia(ref);
      } else {
        setOrdenId('');
        setBusquedaOrden('');
        setMonto('');
        setMetodo(1);
        setReferencia('');
        cargarOrdenesConDeuda();
      }
    }
  }, [isOpen, pagoExistente, esModoEdicion]);

  const cargarOrdenesConDeuda = async () => {
    try {
      setCargandoOrdenes(true);
      const respuesta = await ordenesService.getAll(currentUserId);
      const ordenesPendientes = respuesta.filter((o: any) => {
        const estPago = o.estadoPago ?? o.EstadoPago;
        const est = o.estado ?? o.Estado;
        return estPago === 2 || estPago === 3 || est === 2 || est === 3;
      });
      setOrdenesActivasBD(ordenesPendientes);
    } catch (err) {
      console.error("Error cargando órdenes para el buscador", err);
    } finally {
      setCargandoOrdenes(false);
    }
  };

  const ordenesSugeridas = useMemo(() => {
    if (busquedaOrden.length < 1 || ordenId !== '') return []; 
    
    const busquedaLower = busquedaOrden.toLowerCase();
    return ordenesActivasBD.filter(o => {
      const idString = String(o.id ?? (o as any).Id);
      const facturaString = String(o.numeroFactura ?? (o as any).NumeroFactura).toLowerCase();
      return idString.includes(busquedaLower) || facturaString.includes(busquedaLower);
    });
  }, [busquedaOrden, ordenesActivasBD, ordenId]);

  if (!isOpen) return null;

  const seleccionarOrden = (orden: Orden) => {
    const oId = orden.id ?? (orden as any).Id;
    const numFactura = orden.numeroFactura ?? (orden as any).NumeroFactura;
    setOrdenId(oId);
    setBusquedaOrden(`ORD-${oId} (${numFactura})`);
  };

  const handleCambioBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusquedaOrden(e.target.value);
    setOrdenId(''); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!ordenId || !monto || !metodo) {
      toast.error("Completa los campos obligatorios.");
      return;
    }

    const esPagoDigital = metodo === 2 || metodo === 6 || metodo === 3; 
    if (esPagoDigital && !referencia.trim()) {
      toast.error("Los pagos digitales requieren una referencia obligatoria.");
      return;
    }

    // PAYLOADS ESTRICTAMENTE EN camelCase
    if (esModoEdicion) {
      const pagoCorregido: PagoUpdateDTO = {
        id: pagoExistente.id ?? pagoExistente.Id,
        monto: Number(monto),
        metodo: metodo, 
        referencia: referencia
      };
      onGuardar(pagoCorregido);
    } else {
      const nuevoAbono: PagoStandaloneCreateDTO = {
        ordenId: Number(ordenId),
        monto: Number(monto),
        metodo: metodo, 
        referencia: referencia
      };
      onGuardar(nuevoAbono);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 overflow-visible">
        
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {esModoEdicion ? 'Corregir Registro de Pago' : 'Registrar Nuevo Abono'}
            </h3>
            <p className="text-xs text-slate-500">
              {esModoEdicion ? 'Auditoría y modificación de caja' : 'Ingreso manual a una orden existente'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Buscar Orden Pendiente *</label>
            <input 
              type="text" 
              value={busquedaOrden} 
              onChange={handleCambioBusqueda} 
              disabled={esModoEdicion} 
              className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-emerald-500 ${ordenId !== '' ? 'border-emerald-500 bg-emerald-50/30' : ''}`} 
              placeholder={cargandoOrdenes ? "Cargando órdenes..." : "Buscar por ID (Ej. 12) o N° Factura..."}
            />
            {esModoEdicion && <span className="text-[10px] text-slate-400">El destino del pago no puede modificarse.</span>}

            {!esModoEdicion && ordenesSugeridas.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {ordenesSugeridas.map((orden) => {
                  const oId = orden.id ?? (orden as any).Id;
                  const numFactura = orden.numeroFactura ?? (orden as any).NumeroFactura;
                  const totalDivisa = orden.totalDivisa ?? (orden as any).TotalDivisa;

                  return (
                    <div 
                      key={oId} 
                      onClick={() => seleccionarOrden(orden)}
                      className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold text-emerald-700 text-sm">ORD-{oId}</span>
                        <span className="text-xs text-slate-500 ml-2 font-mono">{numFactura}</span>
                      </div>
                      <span className="text-xs font-semibold text-rose-500">Deuda: ${totalDivisa}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monto (USD) *</label>
              <input 
                type="number" 
                step="0.01" 
                value={monto} 
                onChange={(e) => setMonto(e.target.value)} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Método *</label>
              <select 
                value={metodo} 
                onChange={(e) => setMetodo(Number(e.target.value))} 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none"
              >
                <option value={1}>Punto de Venta</option>
                <option value={2}>Pago Móvil</option>
                <option value={3}>BioPago</option>
                <option value={4}>Efectivo (Bs)</option>
                <option value={5}>Divisas</option>
                <option value={6}>Transferencia</option>
              </select>
            </div>
          </div>


          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Referencia</label>
            <input 
              type="text" 
              value={referencia} 
              onChange={(e) => setReferencia(e.target.value)} 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50" 
              placeholder="Requerido para pagos digitales..."
            />
          </div>
          
            <AuditoriaFooter datosAuditales={pagoExistente} />

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            
            <div className="inline-block" title={!puedeGestionarPagos ? "No posees los privilegios necesarios para procesar transacciones contables." : ""}>
              <button 
                type="submit" 
                disabled={!puedeGestionarPagos}
                className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors ${!puedeGestionarPagos ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : esModoEdicion ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
              >
                {esModoEdicion ? 'Guardar Corrección' : 'Registrar Abono'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}