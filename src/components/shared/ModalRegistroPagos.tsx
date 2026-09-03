import React, { useState, useEffect, useMemo } from 'react';
import { ordenesService } from '../../services/ordenesService'; // Importamos el servicio de órdenes
import type { PagoStandaloneCreateDTO } from '../../types/DTOs/PagoStandaloneCreateDTO';
import type { PagoUpdateDTO } from '../../types/DTOs/PagoUpdateDTO';
// Asegúrate de tener importado tu modelo de Orden
import type { Orden } from '../../types/OrdenesModel'; 

interface ModalRegistroPagoProps {
  isOpen: boolean;               
  onClose: () => void;           
  onGuardar: (datos: PagoStandaloneCreateDTO | PagoUpdateDTO) => void; 
  pagoExistente: any | null; 
}

export function ModalRegistroPago({ isOpen, onClose, onGuardar, pagoExistente }: ModalRegistroPagoProps) {
  
  // Estados del Formulario
  const [ordenId, setOrdenId] = useState<number | ''>('');
  const [monto, setMonto] = useState<string>('');
  const [metodo, setMetodo] = useState<number>(1); 
  const [referencia, setReferencia] = useState('');

  // Nuevos estados para el buscador inteligente
  const [busquedaOrden, setBusquedaOrden] = useState('');
  const [ordenesActivasBD, setOrdenesActivasBD] = useState<Orden[]>([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);

  const esModoEdicion = !!pagoExistente;
  const currentUserId = 1; // ID del administrador

  useEffect(() => {
    if (isOpen) {
      if (esModoEdicion) {
        setOrdenId(pagoExistente.OrdenId || pagoExistente.ordenId);
        setBusquedaOrden(`ORD-${pagoExistente.OrdenId || pagoExistente.ordenId}`); // Mostrar visualmente qué orden es
        setMonto(pagoExistente.Monto.toString());
        setMetodo(pagoExistente.Metodo);
        setReferencia(pagoExistente.Referencia || '');
      } else {
        // Limpiamos al crear uno nuevo
        setOrdenId('');
        setBusquedaOrden('');
        setMonto('');
        setMetodo(1);
        setReferencia('');
        
        // Cargar las órdenes disponibles solo si es un abono nuevo
        cargarOrdenesConDeuda();
      }
    }
  }, [isOpen, pagoExistente, esModoEdicion]);

  // Función para obtener las órdenes y filtrar las que están pagadas
  const cargarOrdenesConDeuda = async () => {
    try {
      setCargandoOrdenes(true);
      const respuesta = await ordenesService.getAll(currentUserId);
      
      // Filtramos en memoria: Asumiendo que EstadoPago 1 es "Pagado" y 4 "Cancelado". 
      // Nos quedamos con Pendiente (2) y Parcial (3).
      // Nota: Ajusta la lectura de la propiedad según la capitalización real de tu API (Estado o EstadoPago)
      const ordenesPendientes = respuesta.filter((o: any) => 
        o.EstadoPago === 2 || o.EstadoPago === 3 || o.Estado === 2 || o.Estado === 3
      );
      
      setOrdenesActivasBD(ordenesPendientes);
    } catch (err) {
      console.error("Error cargando órdenes para el buscador", err);
    } finally {
      setCargandoOrdenes(false);
    }
  };

  // Filtrado instantáneo en memoria para el autocompletado
  const ordenesSugeridas = useMemo(() => {
    if (busquedaOrden.length < 1 || ordenId !== '') return []; // No sugerir si ya se seleccionó una
    
    const busquedaLower = busquedaOrden.toLowerCase();
    return ordenesActivasBD.filter(o => {
      const idString = String(o.Id);
      const facturaString = String(o.NumeroFactura).toLowerCase();
      return idString.includes(busquedaLower) || facturaString.includes(busquedaLower);
    });
  }, [busquedaOrden, ordenesActivasBD, ordenId]);

  if (!isOpen) return null;

  const seleccionarOrden = (orden: Orden) => {
    setOrdenId(orden.Id);
    setBusquedaOrden(`ORD-${orden.Id} (${orden.NumeroFactura})`);
    
    // Opcional: Podrías autocompletar el monto con el saldo restante si tu backend te lo envía
  };

  const handleCambioBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusquedaOrden(e.target.value);
    setOrdenId(''); // Si el usuario vuelve a teclear, borramos el ID oficial para forzarlo a seleccionar de nuevo
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 

    if (!ordenId || !monto || !metodo) {
      alert("Completa los campos obligatorios.");
      return;
    }

    const esPagoDigital = metodo === 2 || metodo === 6 || metodo === 3; 
    if (esPagoDigital && !referencia.trim()) {
      alert("Los pagos digitales requieren una referencia obligatoria.");
      return;
    }

    if (esModoEdicion) {
      const pagoCorregido: PagoUpdateDTO = {
        Id: pagoExistente.Id || pagoExistente.id,
        Monto: Number(monto),
        Metodo: metodo, // CORREGIDO: Antes decía PagoMetodo
        Referencia: referencia
      };
      onGuardar(pagoCorregido);
    } else {
      const nuevoAbono: PagoStandaloneCreateDTO = {
        OrdenId: Number(ordenId),
        Monto: Number(monto),
        Metodo: metodo, // CORREGIDO: Antes decía PagoMetodo
        Referencia: referencia
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
          
          {/* BUSCADOR DE ÓRDENES */}
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

            {/* Menú Desplegable del Autocompletado */}
            {!esModoEdicion && ordenesSugeridas.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                {ordenesSugeridas.map((orden) => (
                  <div 
                    key={orden.Id} 
                    onClick={() => seleccionarOrden(orden)}
                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-emerald-700 text-sm">ORD-{orden.Id}</span>
                      <span className="text-xs text-slate-500 ml-2 font-mono">{orden.NumeroFactura}</span>
                    </div>
                    <span className="text-xs font-semibold text-rose-500">Deuda: ${orden.TotalDivisa}</span>
                  </div>
                ))}
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
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${esModoEdicion ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {esModoEdicion ? 'Guardar Corrección' : 'Registrar Abono'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}