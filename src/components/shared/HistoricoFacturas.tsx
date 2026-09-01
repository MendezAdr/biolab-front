import React, { useState, useEffect } from 'react';
import { ordenesService } from '../../services/ordenesService'; 
import { ModalDetallesFactura } from './ModalDetallesFactura';

export function HistoricoFacturas() {
  const [listaFacturas, setListaFacturas] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para controlar el modal de detalles
  const [facturaSeleccionadaId, setFacturaSeleccionadaId] = useState<number | null>(null);

  const currentUserId = 1; 

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      setError(null); 
      const respuesta = await ordenesService.getAll(currentUserId);
      setListaFacturas(respuesta || []); 
    } catch (err) {
      console.error("Error al obtener histórico:", err);
      setError("No pudimos conectar con el servidor para cargar el historial de facturas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // Función para manejar el botón de "Nueva Factura"
  const navegarANuevaFactura = () => {
    // Aquí a futuro usarás React Router (ej. navigate('/nueva-factura')) o cambiarás el estado de la vista principal
    alert("Navegando al módulo de 'Creación de Nueva Factura' (Pantalla completa en desarrollo).");
  };

  if (cargando) {
    return <div className="flex justify-center items-center h-64 text-slate-500">Cargando histórico...</div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-center max-w-2xl mx-auto">
        <p className="font-semibold">{error}</p>
        <button onClick={cargarHistorial} className="mt-4 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-sm">
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2">
      
      {/* Encabezado Principal */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Histórico de Facturas</h2>
          <p className="text-sm text-slate-500">Consulta y reimpresión de órdenes registradas</p>
        </div>
        
        {/* Este botón ya no abre un modal, sino que iniciará un flujo nuevo */}
        <button 
          onClick={navegarANuevaFactura}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          + Crear Nueva Factura
        </button>
      </div>

      {/* Tabla Resumida de Historial */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">N° Documento</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">ID Paciente</th>
                <th className="p-4 text-right">Total (USD)</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {listaFacturas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No hay facturas registradas.
                  </td>
                </tr>
              ) : (
                listaFacturas.map((factura) => (
                  <tr key={factura.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-semibold text-emerald-700">{factura.numeroFactura}</td>
                    <td className="p-4 text-slate-500">{new Date(factura.fecha).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-600">{factura.pacienteId}</td>
                    <td className="p-4 font-bold text-slate-800 text-right">${factura.totalDivisa}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setFacturaSeleccionadaId(factura.id)}
                        className="text-sky-600 hover:text-sky-800 font-medium text-xs bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded transition-colors"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal inyectado condicionalmente */}
      <ModalDetallesFactura 
        isOpen={facturaSeleccionadaId !== null} 
        ordenId={facturaSeleccionadaId}
        onClose={() => setFacturaSeleccionadaId(null)} 
      />
      
    </div>
  );
}