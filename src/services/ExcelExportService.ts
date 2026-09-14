import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { ReporteCaja } from './ImpresionesService';

export const excelExportService = {
  
  exportarCaja: async (reporte: ReporteCaja) => {
    // 1. Creamos el libro y la hoja
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Cierre de Caja');

    // [FUTURO LOGO]: Aquí usarás workbook.addImage() y sheet.addImage()

    // 2. Título principal (Mezclando celdas A1 a C1)
    sheet.mergeCells('A1:C1');
    const titulo = sheet.getCell('A1');
    titulo.value = 'LABORATORIO RIV_CARR - CIERRE DE CAJA';
    titulo.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Fondo oscuro
    titulo.alignment = { horizontal: 'center' };

    // 3. Subtítulos (Fechas y Totales)
    sheet.getCell('A3').value = `Periodo: ${reporte.rango.inicio} al ${reporte.rango.fin}`;
    sheet.getCell('A4').value = `Total Ingresos (USD): $${reporte.totalFacturadoDivisa}`;
    sheet.getCell('A4').font = { bold: true };

    // 4. Cabeceras de la tabla
    sheet.getRow(6).values = ['ID Método', 'Método de Pago', 'Monto Acumulado (USD)'];
    sheet.getRow(6).font = { bold: true };
    sheet.getRow(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

    // 5. Inyectar los datos
    reporte.desglosePorMetodo.forEach((metodo) => {
      sheet.addRow([metodo.metodoId, metodo.nombre, metodo.montoTotal]);
    });

    // 6. Ajustar el ancho de las columnas
    sheet.columns = [
      { width: 15 }, // ID
      { width: 30 }, // Nombre
      { width: 25 }  // Monto
    ];

    // 7. Empaquetar y Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `RIV_CARR_Cierre_Caja_${new Date().getTime()}.xlsx`);
  }
};