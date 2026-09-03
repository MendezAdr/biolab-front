import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { examenesService } from '../../services/examenesService';
import { tasaService } from '../../services/tasaService';
import type { Examen } from '../../types/ExamenModel';

export function PanelPresupuestos() {
  const [examenesBD, setExamenesBD] = useState<Examen[]>([]);
  const [tasaBcv, setTasaBcv] = useState<number>(0);
  const [cargando, setCargando] = useState(true);
  
  // Estados del Presupuesto
  const [nombreCliente, setNombreCliente] = useState('');
  const [busquedaExamen, setBusquedaExamen] = useState('');
  const [carrito, setCarrito] = useState<Examen[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [examenesRes, tasaRes] = await Promise.all([
          examenesService.getAll(),
          tasaService.getTasaActual()
        ]);
        setExamenesBD(examenesRes || []);
        setTasaBcv(tasaRes || 0);
      } catch (err) {
        console.error("Error al cargar datos para presupuesto:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const examenesFiltrados = useMemo(() => {
    if (!busquedaExamen) return examenesBD;
    const busquedaLower = busquedaExamen.toLowerCase();
    return examenesBD.filter(e => {
      const nombreSeguro = String(e.NombreExamen || '').toLowerCase();
      return nombreSeguro.includes(busquedaLower);
    });
  }, [busquedaExamen, examenesBD]);

  const agregarAlCarrito = (examen: Examen) => {
    if (!carrito.find(e => e.Id === examen.Id)) {
      setCarrito([...carrito, examen]);
    }
  };

  const quitarDelCarrito = (idExamen: number) => {
    setCarrito(carrito.filter(e => e.Id !== idExamen));
  };

  const limpiarPresupuesto = () => {
    setCarrito([]);
    setNombreCliente('');
    setBusquedaExamen('');
  };

  const totalDivisa = carrito.reduce((acc, ex) => acc + (ex.CostoEnDivisa || 0), 0);
  const totalBolivares = totalDivisa * tasaBcv;

  // -----------------------------------------------------------------
  // ACCIONES DE NAVEGACIÓN (Enviando datos de forma invisible)
  // -----------------------------------------------------------------
  
  const convertirAOrden = () => {
    if (carrito.length === 0) return;
    navigate('/nueva-orden', { state: { examenesPreCargados: carrito } });
  };

  const enviarAImpresion = () => {
    if (carrito.length === 0) {
      alert("Agregue al menos un examen para generar el presupuesto.");
      return;
    }
    
    // Empaquetamos toda la información necesaria para el módulo de impresiones
    const paqueteImpresion = {
      tipoDocumento: 'presupuesto',
      datos: {
        cliente: nombreCliente || 'No especificado',
        examenes: carrito,
        totalDivisa: totalDivisa,
        totalBolivares: totalBolivares,
        tasaBcv: tasaBcv,
        fecha: new Date().toISOString()
      }
    };

    // Navegamos al módulo de impresión enviando el paquete
    navigate('/impresiones', { state: paqueteImpresion });
  };

  if (cargando) return <div className="p-10 text-center animate-pulse text-slate-500">Cargando catálogo de exámenes...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Buscador */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Selección de Exámenes</h3>
            
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="🔍 Buscar examen por nombre..."
                value={busquedaExamen}
                onChange={(e) => setBusquedaExamen(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto border border-slate-100 rounded-lg">
              {examenesFiltrados.map(examen => (
                <div key={examen.Id} className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{examen.NombreExamen}</p>
                    <p className="text-xs text-slate-500 max-w-md truncate">{examen.Descripcion || 'Sin descripción'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-600">${examen.CostoEnDivisa}</span>
                    <button onClick={() => agregarAlCarrito(examen)} className="text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs font-bold transition-colors">
                      Añadir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Resumen del Presupuesto */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg sticky top-6">
            <h3 className="font-bold text-lg mb-4 border-b border-slate-600 pb-2">Detalle del Presupuesto</h3>
            
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre del Cliente (Opcional)</label>
              <input 
                type="text" 
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-700 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="min-h-[150px] max-h-[300px] overflow-y-auto mb-4 space-y-2 pr-2">
              {carrito.length === 0 ? (
                <p className="text-sm text-slate-400 text-center italic mt-10">Agregue exámenes al presupuesto.</p>
              ) : (
                carrito.map(ex => (
                  <div key={ex.Id} className="flex justify-between text-sm bg-slate-700 p-2 rounded">
                    <span className="truncate pr-2">{ex.NombreExamen}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400">${ex.CostoEnDivisa}</span>
                      <button onClick={() => quitarDelCarrito(ex.Id)} className="text-rose-400 hover:text-rose-300 font-bold">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-600 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Subtotal USD:</span>
                <span>${totalDivisa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-emerald-400 pt-2 border-t border-slate-600">
                <span>TOTAL APROX:</span>
                <span>${totalDivisa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-sky-300">
                <span>Equivalente VES (Ref):</span>
                <span>Bs. {totalBolivares.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button 
                onClick={convertirAOrden}
                disabled={carrito.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                <span>📝</span> Crear Orden
              </button>

              {/* AQUÍ ESTÁ EL BOTÓN ACTUALIZADO */}
              <button 
                onClick={enviarAImpresion}
                disabled={carrito.length === 0}
                className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                <span>🖨️</span> Generar PDF / Imprimir
              </button>

              <button 
                onClick={limpiarPresupuesto}
                className="w-full bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-700 font-medium py-2 rounded-lg transition-colors"
              >
                Limpiar Todo
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}