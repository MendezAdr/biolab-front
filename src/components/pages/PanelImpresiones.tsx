import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ordenesService } from '../../services/ordenesService';
import { pacienteService } from '../../services/pacienteService'; // Importamos el servicio de pacientes
import { impresionesService, type ReporteCaja, type ReportePacientes, type ReporteMorosos } from '../../services/ImpresionesService';

type TipoReporte = 'presupuesto' | 'cierre_diario' | 'cierre_fechas' | 'pacientes' | 'morosos' | null;

export function PanelImpresiones() {
  const location = useLocation();
  const paqueteExterno = location.state; 
  const currentUserId = 1; 

  const [tipoReporteSeleccionado, setTipoReporteSeleccionado] = useState<TipoReporte>(
    paqueteExterno?.tipoDocumento === 'presupuesto' ? 'presupuesto' : 'cierre_diario'
  );

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados para almacenar los resultados del Orquestador
  const [reporteCaja, setReporteCaja] = useState<ReporteCaja | null>(null);
  const [reportePacientes, setReportePacientes] = useState<ReportePacientes | null>(null);
  const [reporteMorosos, setReporteMorosos] = useState<ReporteMorosos | null>(null);
  const datosPresupuesto = paqueteExterno?.tipoDocumento === 'presupuesto' ? paqueteExterno.datos : null;

  useEffect(() => {
    if (datosPresupuesto) {
      window.history.replaceState({}, document.title);
    }
  }, [datosPresupuesto]);

  // Limpia los resultados previos al cambiar de tipo de reporte
  useEffect(() => {
    setReporteCaja(null);
    setReportePacientes(null);
    setReporteMorosos(null);
    
    // Si seleccionan cierre diario, pre-cargamos las fechas con el día de hoy
    if (tipoReporteSeleccionado === 'cierre_diario') {
      const hoy = new Date().toISOString().split('T')[0];
      setFechaInicio(hoy);
      setFechaFin(hoy);
    } else {
      setFechaInicio('');
      setFechaFin('');
    }
  }, [tipoReporteSeleccionado]);

  const manejarGenerarReporte = async () => {
    setCargando(true);
    try {
      if (tipoReporteSeleccionado === 'cierre_diario' || tipoReporteSeleccionado === 'cierre_fechas') {
        if (!fechaInicio || !fechaFin) return alert("Seleccione las fechas.");
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        
        const ordenesBrutas = await ordenesService.getByFechas(inicio, fin, currentUserId);
        setReporteCaja(impresionesService.generarReporteCaja(ordenesBrutas, fechaInicio, fechaFin));
      
      } else if (tipoReporteSeleccionado === 'pacientes') {
        const pacientesBrutos = await pacienteService.getAll();
        setReportePacientes(impresionesService.generarReportePacientes(pacientesBrutos));
      
      } else if (tipoReporteSeleccionado === 'morosos') {
        const [ordenesBrutas, pacientesBrutos] = await Promise.all([
          ordenesService.getAll(currentUserId), // Traemos todas para filtrar pendientes en memoria
          pacienteService.getAll()
        ]);
        setReporteMorosos(impresionesService.generarReporteMorosos(ordenesBrutas, pacientesBrutos));
      }
    } catch (err) {
      alert("Error al generar el reporte.");
    } finally {
      setCargando(false);
    }
  };

  const hayReporteGenerado = reporteCaja || reportePacientes || reporteMorosos || datosPresupuesto;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
        
        {/* PANEL LATERAL: Selector de Reportes */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Tipo de Reporte</h3>
          
          <button onClick={() => setTipoReporteSeleccionado('cierre_diario')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tipoReporteSeleccionado === 'cierre_diario' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}>
            📅 Cierre de Caja Diario
          </button>
          <button onClick={() => setTipoReporteSeleccionado('cierre_fechas')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tipoReporteSeleccionado === 'cierre_fechas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}>
            📆 Reporte por Fechas
          </button>
          <button onClick={() => setTipoReporteSeleccionado('morosos')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tipoReporteSeleccionado === 'morosos' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}>
            ⚠️ Órdenes Pendientes (Morosos)
          </button>
          <button onClick={() => setTipoReporteSeleccionado('pacientes')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tipoReporteSeleccionado === 'pacientes' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}>
            👥 Directorio de Pacientes
          </button>
          {datosPresupuesto && (
            <div className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-sky-50 text-sky-700 border border-sky-200 mt-4">
               📄 Presupuesto Pendiente
            </div>
          )}
        </div>

        {/* PANEL CENTRAL: Controles y Acciones */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Configuración del Documento</h2>
            <p className="text-sm text-slate-500 mb-6">Ajuste los parámetros antes de generar la vista previa.</p>

            {/* Renderizado Condicional de Controles */}
            {(tipoReporteSeleccionado === 'cierre_fechas' || tipoReporteSeleccionado === 'cierre_diario') && (
              <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha de Inicio</label>
                  <input type="date" disabled={tipoReporteSeleccionado === 'cierre_diario'} value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm disabled:bg-slate-200" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha de Fin</label>
                  <input type="date" disabled={tipoReporteSeleccionado === 'cierre_diario'} value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full border border-slate-300 text-slate-700 rounded-lg px-3 py-2 text-sm disabled:bg-slate-200" />
                </div>
              </div>
            )}
            
            {tipoReporteSeleccionado === 'pacientes' && (
              <div className="p-4 bg-sky-50 border border-sky-100 rounded-lg mb-6">
                <p className="text-sm text-sky-800">Se extraerá el registro completo de pacientes ordenado alfabéticamente.</p>
              </div>
            )}

            {tipoReporteSeleccionado === 'morosos' && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg mb-6">
                <p className="text-sm text-amber-800">Se generará un cruce de datos con todas las órdenes que tengan saldo pendiente hasta el día de hoy.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between border-t border-slate-100 pt-4">
            <button 
              onClick={() => alert("Módulo de exportación a Excel (.xlsx) en construcción.")}
              disabled={!hayReporteGenerado || datosPresupuesto !== null}
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 disabled:opacity-50 px-6 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              📊 Exportar a Excel
            </button>

            <div className="space-x-3">
              {!datosPresupuesto && (
                <button onClick={manejarGenerarReporte} disabled={cargando} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                  {cargando ? 'Cargando...' : '👁️ Cargar Vista Previa'}
                </button>
              )}
              <button 
                onClick={() => window.print()}
                disabled={!hayReporteGenerado}
                className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-colors"
              >
                🖨️ Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* VISTA PREVIA (Estilo "Hoja de Papel" en pantalla, visible y lista para imprimir) */}
      {/* ========================================== */}
      
      {hayReporteGenerado && (
        <div className="mt-8 mb-20">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 print:hidden">--- Vista Previa del Documento ---</p>
          
          {/* El contenedor que simula la hoja A4 */}
          <div className="bg-white shadow-2xl max-w-[21cm] min-h-[29.7cm] mx-auto p-12 border border-slate-200 print:shadow-none print:max-w-none print:border-none print:m-0 print:p-0 text-black">
            
            {/* ENCABEZADO UNIVERSAL */}
            <div className="text-center mb-8 border-b-2 border-slate-800 pb-4">
              <h1 className="text-2xl font-bold uppercase tracking-widest">Laboratorio BioLab</h1>
              {tipoReporteSeleccionado === 'presupuesto' && <p className="text-lg mt-1 font-semibold">Presupuesto de Servicios</p>}
              {(tipoReporteSeleccionado === 'cierre_diario' || tipoReporteSeleccionado === 'cierre_fechas') && <p className="text-lg mt-1 font-semibold">Cierre y Totalización de Caja</p>}
              {tipoReporteSeleccionado === 'pacientes' && <p className="text-lg mt-1 font-semibold">Directorio de Pacientes</p>}
              {tipoReporteSeleccionado === 'morosos' && <p className="text-lg mt-1 font-semibold">Reporte de Órdenes Pendientes y Morosidad</p>}
            </div>

            {/* CONTENIDO ESPECÍFICO DEL REPORTE */}

            {/* 1. PRESUPUESTO */}
            {datosPresupuesto && (
               <div className="space-y-6">
                <div className="flex justify-between text-sm">
                  <p><span className="font-bold">Cliente:</span> {datosPresupuesto.cliente}</p>
                  <p><span className="font-bold">Tasa BCV:</span> Bs. {datosPresupuesto.tasaBcv.toFixed(2)}</p>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="p-2 font-semibold text-sm">Examen</th>
                      <th className="p-2 font-semibold text-sm text-right">Costo (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {datosPresupuesto.examenes.map((ex: any) => (
                      <tr key={ex.Id}><td className="p-2 text-sm">{ex.NombreExamen}</td><td className="p-2 text-sm text-right">${ex.CostoEnDivisa.toFixed(2)}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right space-y-1 mt-4">
                  <p className="font-bold text-lg">Total USD: ${datosPresupuesto.totalDivisa.toFixed(2)}</p>
                  <p className="text-sm font-semibold">Total VES: Bs. {datosPresupuesto.totalBolivares.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* 2. REPORTE DE CAJA */}
            {reporteCaja && !datosPresupuesto && (
              <div className="space-y-6">
                <div className="flex justify-between text-sm">
                  <p><span className="font-bold">Periodo:</span> {reporteCaja.rango.inicio} al {reporteCaja.rango.fin}</p>
                  <p><span className="font-bold">Órdenes Procesadas:</span> {reporteCaja.totalOrdenes}</p>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300">
                      <th className="p-2 font-semibold text-sm">Método de Pago</th>
                      <th className="p-2 font-semibold text-sm text-right">Monto (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reporteCaja.desglosePorMetodo.map((m) => (
                      <tr key={m.metodoId}><td className="p-2 text-sm">{m.nombre}</td><td className="p-2 text-sm text-right">${m.montoTotal.toFixed(2)}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right space-y-1 mt-4">
                  <p className="font-bold text-lg">INGRESOS USD: ${reporteCaja.totalFacturadoDivisa.toFixed(2)}</p>
                  <p className="text-sm font-semibold">Facturado VES (Aprox): Bs. {reporteCaja.totalFacturadoBs.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* 3. DIRECTORIO DE PACIENTES */}
            {reportePacientes && (
              <div className="space-y-6">
                <p className="text-sm mb-4"><span className="font-bold">Total Registrados:</span> {reportePacientes.totalPacientes}</p>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-xs">
                      <th className="p-2 font-semibold">Nombre Completo</th>
                      <th className="p-2 font-semibold">Cédula</th>
                      <th className="p-2 font-semibold">Teléfono</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportePacientes.pacientes.map((p) => (
                      <tr key={p.Id}><td className="p-2 text-sm">{p.Nombre} {p.Apellido}</td><td className="p-2 text-sm">{p.Cedula}</td><td className="p-2 text-sm">{p.Telefono}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. REPORTE DE MOROSOS */}
            {reporteMorosos && (
              <div className="space-y-6">
                <p className="text-sm mb-4"><span className="font-bold">Deuda Global en la Calle:</span> <span className="text-rose-600 font-bold">${reporteMorosos.totalDeudaDivisa.toFixed(2)}</span></p>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-xs">
                      <th className="p-2 font-semibold">Factura</th>
                      <th className="p-2 font-semibold">Paciente</th>
                      <th className="p-2 font-semibold">Fecha Emisión</th>
                      <th className="p-2 font-semibold text-right">Deuda (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reporteMorosos.ordenes.map((o) => (
                      <tr key={o.ordenId}>
                        <td className="p-2 text-sm font-mono text-slate-500">{o.numeroFactura}</td>
                        <td className="p-2 text-sm font-semibold">{o.pacienteNombre} <br/><span className="text-xs font-normal text-slate-400">CI: {o.pacienteCedula}</span></td>
                        <td className="p-2 text-sm">{o.fechaEmision.toLocaleDateString()}</td>
                        <td className="p-2 text-sm text-right font-bold text-rose-600">${o.deudaPendiente.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PIE DE PÁGINA UNIVERSAL */}
            <div className="mt-16 text-center text-xs text-slate-400 border-t border-slate-200 pt-4">
              <p>Documento generado por el sistema automatizado BioLab el {new Date().toLocaleString()}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}