import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ordenesService } from '../../services/ordenesService';
import { pacienteService } from '../../services/pacienteService'; // Importamos el servicio de pacientes
import { impresionesService, type ReporteCaja, type ReportePacientes, type ReporteMorosos } from '../../services/ImpresionesService';
import { PDFViewer, PDFDownloadLink, Document, Page } from '@react-pdf/renderer';
import { ReporteCajaPDF } from '../pdf/ReporteCajaPDF';
import { ReporteMorososPDF } from '../pdf/ReporteMorososPDF';
import { PresupuestoPDF } from '../pdf/PresupuestoPDF';
import { ReportePacientesPDF } from '../pdf/ReportePacientesPDF';
import { excelExportService } from '../../services/ExcelExportService';

type TipoReporte = 'presupuesto' | 'cierre_diario' | 'cierre_fechas' | 'pacientes' | 'morosos' | null;

export function PanelImpresiones() {
  //helper para determinar tipo de impresion:
  const obtenerDocumentoPDF = () => {
    if (reporteCaja && !datosPresupuesto) return <ReporteCajaPDF reporte={reporteCaja} usuarioNombre={currentUser.nombre} />;
    if (datosPresupuesto) return <PresupuestoPDF datos={datosPresupuesto} usuarioNombre={currentUser.nombre} />;
    if (reportePacientes) return <ReportePacientesPDF reporte={reportePacientes} usuarioNombre={currentUser.nombre} />;
    if (reporteMorosos) return <ReporteMorososPDF reporte={reporteMorosos} usuarioNombre={currentUser.nombre} />;
    
    // Retorno de seguridad (nunca debería llegar aquí)
    return <Document><Page/></Document>; 
  };

  // helper de excel
  const manejarExportacionExcel = () => {
    if (reporteCaja) {
      excelExportService.exportarCaja(reporteCaja);
    } else if (reporteMorosos) {
      // excelExportService.exportarMorosos(reporteMorosos);
    }
  };
  

  const location = useLocation();
  const paqueteExterno = location.state; 
  const currentUserId = 1; 

  const [tipoReporteSeleccionado, setTipoReporteSeleccionado] = useState<TipoReporte>(
    paqueteExterno?.tipoDocumento === 'presupuesto' ? 'presupuesto' : 'cierre_diario'
  );


  const vistaPreviaRef = useRef<HTMLDivElement>(null);

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados para almacenar los resultados del Orquestador
  const [reporteCaja, setReporteCaja] = useState<ReporteCaja | null>(null);
  const [reportePacientes, setReportePacientes] = useState<ReportePacientes | null>(null);
  const [reporteMorosos, setReporteMorosos] = useState<ReporteMorosos | null>(null);
  const datosPresupuesto = paqueteExterno?.tipoDocumento === 'presupuesto' ? paqueteExterno.datos : null;
  
                  /* =======================================================*/
                  /*                    Inyeccion de usuario                */
                  /* =======================================================*/
  const currentUser = {
    id: 1,
    nombre: "Adrián Méndez",
    rol: "Administrador"
  };

  const puedeExportarExcel = !!reporteCaja || !!reporteMorosos;

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
        
        setTimeout(() => {
        vistaPreviaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
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
              onClick={manejarExportacionExcel}
              disabled={!puedeExportarExcel || datosPresupuesto !== null}
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 disabled:opacity-50 px-6 py-2 rounded-lg text-sm font-bold transition-colors"
            >
              📊 Exportar a Excel
            </button>

            <div className="space-x-3 flex items-center">
              {!datosPresupuesto && (
                <button onClick={manejarGenerarReporte} disabled={cargando} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                  {cargando ? 'Cargando...' : '👁️ Cargar Vista Previa'}
                </button>
              )}
              
              {/* === NUEVO BOTÓN CONECTADO AL PDF === */}
              {hayReporteGenerado ? (
                <PDFDownloadLink
                  document={obtenerDocumentoPDF()}
                  fileName={`RIV_CARR_${tipoReporteSeleccionado}_${new Date().getTime()}.pdf`}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center justify-center h-[38px]"
                >
                  {({ loading }) => (loading ? '⏳ Preparando...' : '📥 Descargar PDF')}
                </PDFDownloadLink>
              ) : (
                <button 
                  disabled
                  className="bg-sky-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md transition-colors h-[38px]"
                >
                  📥 Descargar PDF
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* VISTA PREVIA (Estilo "Hoja de Papel" en pantalla, visible y lista para imprimir) */}
      {/* ========================================== */}
      
      {hayReporteGenerado && (
        <div ref={vistaPreviaRef} className="mt-8 mb-20">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 print:hidden">
            --- Vista Previa del Documento ---
          </p>
          
          {/* ELIMINAMOS EL "FALSO A4" Y LE DIMOS UNA ALTURA FIJA AL CONTENEDOR */}
          <div className="h-[800px] w-full">
            
            {reporteCaja && !datosPresupuesto && (
              <PDFViewer width="100%" height="100%" className="rounded-xl shadow-2xl border border-slate-300">
                <ReporteCajaPDF reporte={reporteCaja} usuarioNombre={currentUser.nombre} />
              </PDFViewer>
            )}

            {datosPresupuesto && (
              <PDFViewer width="100%" height="100%" className="rounded-xl shadow-2xl border border-slate-300">
                <PresupuestoPDF datos={datosPresupuesto} usuarioNombre={currentUser.nombre} />
              </PDFViewer>
            )}

            {reportePacientes && (
              <PDFViewer width="100%" height="100%" className="rounded-xl shadow-2xl border border-slate-300">
                <ReportePacientesPDF reporte={reportePacientes} usuarioNombre={currentUser.nombre} />
              </PDFViewer>
            )}

            {reporteMorosos && (
              <PDFViewer width="100%" height="100%" className="rounded-xl shadow-2xl border border-slate-300">
                <ReporteMorososPDF reporte={reporteMorosos} usuarioNombre={currentUser.nombre} />
              </PDFViewer>
            )}

          </div>
        </div>
      )}

    </div>
  );
}