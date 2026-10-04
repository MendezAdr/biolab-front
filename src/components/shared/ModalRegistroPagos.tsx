import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast'; 
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
        // EXTRACCIÓN camelCase[cite: 39]
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

    const montoNum = Number(monto);

    if (!ordenId || !montoNum || !metodo) {
      toast.error("Completa los campos obligatorios.");
      return;
    }

    if (montoNum <= 0) {
      toast.error("El monto debe ser un número positivo mayor a cero.");
      return;
    }

    if (!esModoEdicion) {
      const ordenSeleccionada = ordenesActivasBD.find(o => (o.id ?? (o as any).Id) === ordenId);
      
      if (ordenSeleccionada) {
        const totalOrden = ordenSeleccionada.totalDivisa ?? (ordenSeleccionada as any).TotalDivisa ?? 0;
        const pagosAnteriores = ordenSeleccionada.pagos ?? (ordenSeleccionada as any).Pagos ?? [];
        
        const totalPagado = pagosAnteriores.reduce((acc: number, p: any) => acc + (Number(p.monto ?? p.Monto) || 0), 0);
        const deudaRestante = totalOrden - totalPagado;

        if (montoNum > (deudaRestante + 0.01)) {
          toast.error(`El monto supera la deuda. Esta orden solo debe $${deudaRestante.toFixed(2)}`);
          setMonto(deudaRestante.toFixed(2));
          return;
        }
      }
    }

    const esPagoDigital = metodo === 2 || metodo === 6 || metodo === 3; 
    if (esPagoDigital && !referencia.trim()) {
      toast.error("Los pagos digitales requieren una referencia obligatoria.");
      return;
    }

    if (esModoEdicion) {
      const pagoCorregido: PagoUpdateDTO = {
        id: pagoExistente.id ?? pagoExistente.Id,
        monto: montoNum,
        metodo: metodo, 
        referencia: referencia
      };
      onGuardar(pagoCorregido);
    } else {
      const nuevoAbono: PagoStandaloneCreateDTO = {
        ordenId: Number(ordenId),
        monto: montoNum,
        metodo: metodo, 
        referencia: referencia
      };
      onGuardar(nuevoAbono);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-sky-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-md w-full p-7 overflow-visible">
        
        <div className="flex justify-between items-center mb-6 border-b border-sky-50 pb-3">
          <div>
            <h3 className="text-xl font-bold text-sky-900">
              {esModoEdicion ? 'Corregir Registro de Pago' : 'Registrar Nuevo Abono'}
            </h3>
            <p className="text-xs text-sky-600 font-medium mt-1">
              {esModoEdicion ? 'Auditoría y modificación de caja' : 'Ingreso manual a una orden existente'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg p-1.5 transition-colors font-bold text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          
          <div className="relative">
            <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Buscar Orden Pendiente *</label>
            <input 
              type="text" 
              value={busquedaOrden} 
              onChange={handleCambioBusqueda} 
              disabled={esModoEdicion} 
              className={`w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow ${ordenId !== '' ? 'border-emerald-400 bg-emerald-50/50 focus:border-emerald-500 focus:ring-emerald-500' : ''}`} 
              placeholder={cargandoOrdenes ? "Cargando órdenes..." : "Buscar por ID (Ej. 12) o N° Factura..."}
            />
            {esModoEdicion && <span className="text-[10px] text-rose-500 font-medium mt-1 block">* El destino del pago no puede modificarse en correcciones.</span>}

            {!esModoEdicion && ordenesSugeridas.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-sky-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                {ordenesSugeridas.map((orden) => {
                  const oId = orden.id ?? (orden as any).Id;
                  const numFactura = orden.numeroFactura ?? (orden as any).NumeroFactura;
                  const totalDivisa = orden.totalDivisa ?? (orden as any).TotalDivisa;

                  return (
                    <div 
                      key={oId} 
                      onClick={() => seleccionarOrden(orden)}
                      className="p-3 hover:bg-sky-50 cursor-pointer border-b border-slate-100 flex justify-between items-center transition-colors"
                    >
                      <div>
                        <span className="font-bold text-sky-700 text-sm">ORD-{oId}</span>
                        <span className="text-xs text-slate-500 ml-2 font-mono">({numFactura})</span>
                      </div>
                      <span className="text-xs font-bold text-rose-500">Deuda: ${totalDivisa}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Monto (USD) *</label>
              <input 
                type="number" 
                step="0.01" 
                value={monto} 
                onChange={(e) => setMonto(e.target.value)} 
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow" 
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Método *</label>
              <select 
                value={metodo} 
                onChange={(e) => setMetodo(Number(e.target.value))} 
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow"
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
            <label className="block text-xs font-bold text-sky-800 uppercase tracking-wider mb-1.5">Referencia</label>
            <input 
              type="text" 
              value={referencia} 
              onChange={(e) => setReferencia(e.target.value)} 
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow" 
              placeholder="Requerido para pagos digitales..."
            />
          </div>
          
            <AuditoriaFooter datosAuditales={pagoExistente} />

          <div className="flex justify-end space-x-3 pt-5 border-t border-sky-50 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
              Cancelar
            </button>
            
            <div className="inline-block" title={!puedeGestionarPagos ? "No posees los privilegios necesarios para procesar transacciones contables." : ""}>
              <button 
                type="submit" 
                disabled={!puedeGestionarPagos}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all ${!puedeGestionarPagos ? 'bg-slate-300 text-white cursor-not-allowed shadow-none' : esModoEdicion ? 'bg-amber-500 hover:bg-amber-400 text-white hover:-translate-y-0.5' : 'bg-emerald-500 hover:bg-emerald-400 text-white hover:-translate-y-0.5'}`}
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