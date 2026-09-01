import React, { useState, useEffect, useMemo } from 'react';
import { pacienteService } from '../../services/pacienteService';
import { examenesService } from '../../services/examenesService';
import { tasaService } from '../../services/tasaService';
import { ordenesService } from '../../services/ordenesService';
import { ModalNuevoPaciente } from '../shared/ModalNuevoPaciente';
import type { OrdenCreateDTO } from '../../types/DTOs/OrdenCreateDTO';
import type { PacienteCreateDTO } from '../../types/DTOs/PacienteCreateDTO';

export function NuevaOrdenPage() {
  // ==========================================
  // 1. ESTADOS DE DATOS EN MEMORIA (Pre-carga)
  // ==========================================
  const [pacientesBD, setPacientesBD] = useState<any[]>([]);
  const [examenesBD, setExamenesBD] = useState<any[]>([]);
  const [tasaBcv, setTasaBcv] = useState<number>(0);
  
  const [cargandoGlobal, setCargandoGlobal] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  // ==========================================
  // 2. ESTADOS DEL FLUJO DE TRABAJO (Wizard)
  // ==========================================
  
  // Paso 1: Paciente
  const [busquedaCedula, setBusquedaCedula] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any | null>(null);
  const [modalPacienteAbierto, setModalPacienteAbierto] = useState(false);

  // Paso 2: Exámenes
  const [busquedaExamen, setBusquedaExamen] = useState('');
  const [examenesCarrito, setExamenesCarrito] = useState<any[]>([]);

  const currentUserId = 1; // Simulación de auditoría

  // ==========================================
  // 3. EFECTO DE CARGA INICIAL (Rendimiento Local)
  // ==========================================
  const cargarDatosMaestros = async () => {
    try {
      setCargandoGlobal(true);
      
      // Descargamos TODA la información necesaria en paralelo al abrir la pantalla
      const [pacientesRes, examenesRes, tasaRes] = await Promise.all([
        pacienteService.getAll(),
        examenesService.getAll(),
        tasaService.getTasaActual()
      ]);

      setPacientesBD(pacientesRes || []);
      setExamenesBD(examenesRes || []);
      setTasaBcv(tasaRes || 0);

    } catch (err) {
      console.error("Error cargando caché local:", err);
      setErrorGlobal("Fallo al inicializar el módulo de órdenes.");
    } finally {
      setCargandoGlobal(false);
    }
  };

  useEffect(() => {
    cargarDatosMaestros();
  }, []);

  // ==========================================
  // 4. LÓGICA DE FILTRADO EN MEMORIA (Instantáneo)
  // ==========================================
  
  // Filtra pacientes si el usuario escribe al menos 3 números de cédula
  const pacientesSugeridos = useMemo(() => {
    if (busquedaCedula.length < 3) return [];
    return pacientesBD.filter(p => p.cedula.includes(busquedaCedula));
  }, [busquedaCedula, pacientesBD]);

  // Filtra la lista de exámenes según la barra de búsqueda
  const examenesFiltrados = useMemo(() => {
    if (!busquedaExamen) return examenesBD;
    const busquedaLower = busquedaExamen.toLowerCase();
    return examenesBD.filter(e => e.nombreExamen.toLowerCase().includes(busquedaLower));
  }, [busquedaExamen, examenesBD]);

  // Cálculos reactivos de la moneda
  const totalDivisa = examenesCarrito.reduce((acc, ex) => acc + ex.costoEnDivisa, 0);
  const totalBolivares = totalDivisa * tasaBcv;

  // ==========================================
  // 5. MANEJADORES DE EVENTOS
  // ==========================================

  const agregarAlCarrito = (examen: any) => {
    // Evitamos duplicados
    if (!examenesCarrito.find(e => e.id === examen.id)) {
      setExamenesCarrito([...examenesCarrito, examen]);
    }
  };

  const quitarDelCarrito = (idExamen: number) => {
    setExamenesCarrito(examenesCarrito.filter(e => e.id !== idExamen));
  };

  const manejarGuardarPacienteInline = async (nuevoPaciente: PacienteCreateDTO) => {
    try {
      // 1. Guardamos el paciente en el backend
      const pacienteGuardado = await pacienteService.create(nuevoPaciente, currentUserId);
      
      // 2. Refrescamos la memoria local (opcional: podrías inyectarlo directamente al array)
      await cargarDatosMaestros();
      
      // 3. Lo seleccionamos automáticamente para avanzar
      setPacienteSeleccionado(pacienteGuardado);
      setBusquedaCedula(pacienteGuardado.cedula);
      setModalPacienteAbierto(false);
      alert("Paciente registrado y seleccionado con éxito.");
    } catch (err) {
      alert("Error al registrar el paciente.");
    }
  };

  const procesarOrdenFinal = async () => {
    if (!pacienteSeleccionado || examenesCarrito.length === 0) {
      alert("Debes seleccionar un paciente y al menos un examen.");
      return;
    }

    const nuevaOrden: OrdenCreateDTO = {
      NumeroFactura: `ORD-${Date.now()}`, // Generador temporal
      PacienteId: pacienteSeleccionado.id,
      TotalDivisa: totalDivisa,
      TasaBCV: tasaBcv,
      Fecha: new Date(),
      // Mapeamos el carrito al DTO estricto de Detalles
      Detalles: examenesCarrito.map(ex => ({
        ExamenId: ex.id,
        PrecioMomentoDivisa: ex.costoEnDivisa 
      })),
      // Pagos vacíos temporalmente hasta implementar el submódulo
      Pagos: [] 
    };

    try {
      await ordenesService.create(nuevaOrden, currentUserId);
      alert("¡Orden registrada exitosamente!");
      // Limpiamos todo para la siguiente orden
      setPacienteSeleccionado(null);
      setBusquedaCedula('');
      setExamenesCarrito([]);
    } catch (err) {
      alert("Error crítico al procesar la orden.");
    }
  };

  // ==========================================
  // 6. RENDERIZADO VISUAL
  // ==========================================

  if (cargandoGlobal) return <div className="p-10 text-center animate-pulse text-slate-500">Inicializando sistema de facturación...</div>;
  if (errorGlobal) return <div className="p-10 text-center text-red-600">{errorGlobal}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Cabecera con Indicador de Tasa */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Nueva Orden de Laboratorio</h2>
          <p className="text-sm text-slate-500">Facturación bimodal en tiempo real</p>
        </div>
        <div className="bg-sky-50 border border-sky-100 text-sky-800 px-4 py-2 rounded-lg text-sm font-bold flex flex-col items-end">
          <span>Tasa BCV del Día</span>
          <span className="text-lg">Bs. {tasaBcv.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Área de Trabajo (Pasos 1 y 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PASO 1: PACIENTE */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">1. Identificación del Paciente</h3>
            
            {pacienteSeleccionado ? (
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-bold text-emerald-800">{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</p>
                  <p className="text-xs text-emerald-600">C.I: {pacienteSeleccionado.cedula}</p>
                </div>
                <button onClick={() => setPacienteSeleccionado(null)} className="text-xs text-rose-500 hover:underline">
                  Cambiar Paciente
                </button>
              </div>
            ) : (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ingrese Cédula del paciente..."
                  value={busquedaCedula}
                  onChange={(e) => setBusquedaCedula(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
                
                {/* Autocompletado */}
                {busquedaCedula.length >= 3 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    {pacientesSugeridos.length > 0 ? (
                      pacientesSugeridos.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => setPacienteSeleccionado(p)}
                          className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                        >
                          <span className="font-semibold text-sm">{p.cedula}</span> - <span className="text-sm text-slate-600">{p.nombre} {p.apellido}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-slate-500 mb-3">No hay pacientes con esa cédula.</p>
                        <button 
                          onClick={() => setModalPacienteAbierto(true)}
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          + Registrar Nuevo Paciente
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PASO 2: EXÁMENES (Solo visible si hay un paciente seleccionado) */}
          <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-opacity ${!pacienteSeleccionado ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">2. Selección de Exámenes</h3>
            
            <input 
              type="text" 
              placeholder="🔍 Buscar examen (ej. Hematología)..."
              value={busquedaExamen}
              onChange={(e) => setBusquedaExamen(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm mb-4 bg-slate-50"
            />

            <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-lg">
              {examenesFiltrados.map(examen => (
                <div key={examen.id} className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{examen.nombreExamen}</p>
                    <p className="text-xs text-slate-500">Ref: {examen.descripcion?.substring(0,30)}...</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-600">${examen.costoEnDivisa}</span>
                    <button 
                      onClick={() => agregarAlCarrito(examen)}
                      className="text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs font-bold transition-colors"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Carrito y Totalización (Paso 3) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg sticky top-6">
            <h3 className="font-bold text-lg mb-4 border-b border-slate-600 pb-2">Resumen de la Orden</h3>
            
            <div className="min-h-[150px] max-h-[300px] overflow-y-auto mb-4 space-y-2 pr-2">
              {examenesCarrito.length === 0 ? (
                <p className="text-sm text-slate-400 text-center italic mt-10">Aún no hay exámenes añadidos.</p>
              ) : (
                examenesCarrito.map(ex => (
                  <div key={ex.id} className="flex justify-between text-sm bg-slate-700 p-2 rounded">
                    <span className="truncate pr-2">{ex.nombreExamen}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400">${ex.costoEnDivisa}</span>
                      <button onClick={() => quitarDelCarrito(ex.id)} className="text-rose-400 hover:text-rose-300 font-bold">✕</button>
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
                <span>TOTAL:</span>
                <span>${totalDivisa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-sky-300">
                <span>Equivalente VES:</span>
                <span>Bs. {totalBolivares.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={procesarOrdenFinal}
              disabled={examenesCarrito.length === 0 || !pacienteSeleccionado}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Procesar y Guardar Orden
            </button>
          </div>
        </div>

      </div>

      {/* Modal para crear un paciente sobre la marcha */}
      <ModalNuevoPaciente 
        isOpen={modalPacienteAbierto} 
        onClose={() => setModalPacienteAbierto(false)} 
        onGuardar={manejarGuardarPacienteInline}
      />

    </div>
  );
}