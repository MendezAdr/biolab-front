import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import { examenesService } from '../../services/examenesService';
import type { Examen } from '../../types/ExamenModel';

import { useAuth } from '../../context/AuthContext';
import { PERMISOS } from '../../types/AuthTypes';

export function PanelPresupuestos() {
  // 1. INYECTAMOS LA TASA DIRECTAMENTE DESDE EL CONTEXTO GLOBAL
  const { tienePermiso, tasaBcv } = useAuth();
  
  const puedeCrearOrden = tienePermiso(PERMISOS.CREAR_ORDENES_Y_DETALLES);
  const puedeGestionarPresupuestos = tienePermiso(PERMISOS.GESTIONAR_PRESUPUESTOS);

  const [examenesBD, setExamenesBD] = useState<Examen[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // DATOS DEL CLIENTE (Texto libre, sin forzar registro en BD)
  const [nombreCliente, setNombreCliente] = useState('');
  const [cedulaCliente, setCedulaCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');

  const [busquedaExamen, setBusquedaExamen] = useState('');
  const [carrito, setCarrito] = useState<Examen[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (puedeGestionarPresupuestos) {
      const cargarDatos = async () => {
        try {
          setCargando(true);
          // 2. YA NO PEDIMOS LA TASA AL BACKEND
          const examenesRes = await examenesService.getAll();
          setExamenesBD(examenesRes || []);
        } catch (err) {
          toast.error("Error al cargar catálogo para presupuestos.");
        } finally {
          setCargando(false);
        }
      };
      cargarDatos();
    } else {
      setCargando(false);
    }
  }, [puedeGestionarPresupuestos]);

  const examenesFiltrados = useMemo(() => {
    if (!busquedaExamen) return examenesBD;
    const busquedaLower = busquedaExamen.toLowerCase();
    return examenesBD.filter(e => {
      const nombreSeguro = String(e.nombreExamen ?? (e as any).NombreExamen ?? '').toLowerCase();
      return nombreSeguro.includes(busquedaLower);
    });
  }, [busquedaExamen, examenesBD]);

  const agregarAlCarrito = (examen: Examen) => {
    const exId = examen.id ?? (examen as any).Id;
    if (!carrito.find(e => (e.id ?? (e as any).Id) === exId)) {
      setCarrito([...carrito, examen]);
    }
  };

  const quitarDelCarrito = (idExamen: number) => {
    setCarrito(carrito.filter(e => (e.id ?? (e as any).Id) !== idExamen));
  };

  const limpiarPresupuesto = () => {
    setCarrito([]);
    setNombreCliente('');
    setCedulaCliente('');
    setTelefonoCliente('');
    setBusquedaExamen('');
  };

  const totalDivisa = carrito.reduce((acc, ex) => acc + (ex.costoEnDivisa ?? (ex as any).CostoEnDivisa ?? 0), 0);
  const totalBolivares = totalDivisa * tasaBcv;
  
  const convertirAOrden = () => {
    if (carrito.length === 0) return;
    navigate('/nueva-orden', { 
        state: { 
            examenesPreCargados: carrito,
            cedulaPreCargada: cedulaCliente 
        } 
    });
  };

  const enviarAImpresion = () => {
    if (carrito.length === 0) {
      toast.error("Agregue al menos un examen para generar el presupuesto.");
      return;
    }
    
    const paqueteImpresion = {
      tipoDocumento: 'presupuesto',
      datos: {
        clienteNombre: nombreCliente || 'Público General',
        clienteCedula: cedulaCliente || 'N/A',
        clienteTelefono: telefonoCliente || 'N/A',
        examenes: carrito,
        totalDivisa: totalDivisa,
        totalBolivares: totalBolivares,
        tasaBcv: tasaBcv,
        fecha: new Date().toISOString()
      }
    };

    navigate('/impresiones', { state: paqueteImpresion });
  };

  if (!puedeGestionarPresupuestos) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-sky-100 rounded-xl shadow-sm mx-auto max-w-2xl mt-12 text-center">
        <span className="text-6xl mb-4 opacity-80">🔒</span>
        <h2 className="text-xl font-bold text-sky-900 mb-2">Acceso Restringido</h2>
        <p className="text-slate-500">
          Tu nivel de acceso actual no te permite generar ni administrar presupuestos en el sistema.
        </p>
      </div>
    );
  }

  if (cargando) return <div className="p-10 text-center animate-pulse text-sky-600 font-medium">Cargando catálogo de exámenes...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-sky-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-sky-900">Generador de Presupuestos</h2>
          <p className="text-sm text-slate-500">Cotización rápida de exámenes sin afectar la caja</p>
        </div>
        <div className="bg-sky-50 border border-sky-200 text-sky-900 px-4 py-2 rounded-lg text-sm font-bold flex flex-col items-end shadow-sm">
          <span className="text-sky-600 text-xs uppercase tracking-wider">Tasa BCV del Día</span>
          <span className="text-lg">Bs. {tasaBcv.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-sky-100 shadow-sm">
            <h3 className="font-bold text-sky-900 mb-4 border-b border-sky-50 pb-2">Selección de Exámenes</h3>
            
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Buscar examen por nombre..."
                value={busquedaExamen}
                onChange={(e) => setBusquedaExamen(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-shadow"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-lg">🔍</span>
            </div>

            <div className="max-h-[400px] overflow-y-auto border border-sky-50 rounded-lg custom-scrollbar">
              {examenesFiltrados.map(examen => {
                const exId = examen.id ?? (examen as any).Id;
                const nombreExamen = examen.nombreExamen ?? (examen as any).NombreExamen;
                const descripcion = examen.descripcion ?? (examen as any).Descripcion;
                const costo = examen.costoEnDivisa ?? (examen as any).CostoEnDivisa;
                const estaEnCarrito = carrito.some(e => (e.id ?? (e as any).Id) === exId);

                return (
                  <div key={exId} className="flex justify-between items-center p-3 hover:bg-sky-50 border-b border-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{nombreExamen}</p>
                      <p className="text-xs text-slate-500 max-w-md truncate">{descripcion || 'Sin descripción'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-emerald-600">${costo}</span>
                      <button 
                        onClick={() => agregarAlCarrito(examen)} 
                        disabled={estaEnCarrito}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          estaEnCarrito 
                            ? 'bg-sky-100 text-sky-500 cursor-not-allowed border border-sky-200' 
                            : 'text-white bg-sky-500 hover:bg-sky-600 hover:shadow-md'
                        }`}
                      >
                        {estaEnCarrito ? 'Añadido ✔️' : 'Añadir'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-sky-900 text-white p-6 rounded-xl shadow-xl border border-sky-800 sticky top-6">
            <h3 className="font-bold text-lg mb-4 border-b border-sky-700 pb-3 flex items-center">
              <span className="mr-2">👤</span> Datos del Cliente
            </h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <input 
                  type="text" 
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Nombre Completo (Opcional)"
                  className="w-full border border-sky-700 rounded-lg px-3 py-2.5 text-sm bg-sky-950 text-sky-100 placeholder-sky-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-shadow"
                />
              </div>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={cedulaCliente}
                  onChange={(e) => setCedulaCliente(e.target.value)}
                  placeholder="Cédula (Opcional)"
                  className="w-1/2 border border-sky-700 rounded-lg px-3 py-2.5 text-sm bg-sky-950 text-sky-100 placeholder-sky-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-shadow"
                />
                <input 
                  type="text" 
                  value={telefonoCliente}
                  onChange={(e) => setTelefonoCliente(e.target.value)}
                  placeholder="Teléfono (Opcional)"
                  className="w-1/2 border border-sky-700 rounded-lg px-3 py-2.5 text-sm bg-sky-950 text-sky-100 placeholder-sky-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-shadow"
                />
              </div>
            </div>

            <h3 className="font-bold text-lg mb-4 border-b border-sky-700 pb-3 flex items-center">
              <span className="mr-2">📝</span> Detalle del Presupuesto
            </h3>
            
            <div className="min-h-[150px] max-h-[250px] overflow-y-auto mb-5 space-y-2.5 pr-2 custom-scrollbar">
              {carrito.length === 0 ? (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-sm text-sky-300/70 text-center italic">Agregue exámenes al presupuesto.</p>
                </div>
              ) : (
                carrito.map(ex => {
                   const exId = ex.id ?? (ex as any).Id;
                   const nombreExamen = ex.nombreExamen ?? (ex as any).NombreExamen;
                   const costo = ex.costoEnDivisa ?? (ex as any).CostoEnDivisa;

                   return (
                    <div key={exId} className="flex justify-between items-center text-sm bg-sky-800/80 p-3 rounded-lg border border-sky-700/50">
                      <span className="truncate pr-2 font-medium">{nombreExamen}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-400">${costo}</span>
                        <button onClick={() => quitarDelCarrito(exId)} className="text-sky-300 hover:text-rose-400 transition-colors font-bold text-xs bg-sky-900 p-1 rounded">✕</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-sky-700 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-sky-100 font-medium">
                <span>Subtotal USD:</span>
                <span className="font-bold">${totalDivisa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-xl text-emerald-400 pt-3 border-t border-sky-800/80 bg-sky-950 p-3 rounded-lg shadow-inner">
                <span>TOTAL APROX:</span>
                <span>${totalDivisa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-sky-300 font-medium px-1">
                <span>Equivalente VES (Ref):</span>
                <span>Bs. {totalBolivares.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              
              <div className="w-full" title={!puedeCrearOrden ? "Tu rol no tiene permiso para crear nuevas órdenes oficiales." : ""}>
                <button 
                  onClick={convertirAOrden}
                  disabled={carrito.length === 0 || !puedeCrearOrden}
                  className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 text-sm uppercase tracking-wide text-white ${(!puedeCrearOrden || carrito.length === 0) ? 'bg-slate-700/50 border border-slate-600 cursor-not-allowed text-slate-400 shadow-none' : 'bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 hover:-translate-y-0.5'}`}
                >
                  <span>📋</span> Convertir a Factura
                </button>
              </div>

              <div className="w-full" title={!puedeGestionarPresupuestos ? "Tu rol no tiene permiso para emitir presupuestos impresos." : ""}>
                <button 
                  onClick={enviarAImpresion}
                  disabled={carrito.length === 0 || !puedeGestionarPresupuestos}
                  className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 text-sm uppercase tracking-wide text-white ${(!puedeGestionarPresupuestos || carrito.length === 0) ? 'bg-slate-700/50 border border-slate-600 cursor-not-allowed text-slate-400 shadow-none' : 'bg-sky-500 hover:bg-sky-400 border border-sky-400 hover:-translate-y-0.5'}`}
                >
                  <span>🖨️</span> Generar PDF
                </button>
              </div>

              <button 
                onClick={limpiarPresupuesto}
                disabled={carrito.length === 0 && !nombreCliente && !cedulaCliente && !telefonoCliente}
                className="w-full bg-transparent border border-sky-700 text-sky-300 hover:bg-sky-800 hover:text-white font-medium py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Limpiar Formulario
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}