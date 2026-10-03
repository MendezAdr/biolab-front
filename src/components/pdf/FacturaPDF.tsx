import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10, color: '#000000', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  logoBox: { width: '25%' },
  logo: { width: 70, height: 70, objectFit: 'contain' },
  titleBox: { width: '50%', textAlign: 'center', justifyContent: 'center' },
  labTitle: { fontSize: 14, fontWeight: 'bold' },
  docInfoBox: { width: '25%', textAlign: 'right', justifyContent: 'center' },
  docTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  
  clientSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  clientDataBox: { width: '75%', border: '1pt solid #000', padding: 8 },
  clientHeader: { fontWeight: 'bold', borderBottom: '1pt solid #000', paddingBottom: 4, marginBottom: 4, textAlign: 'center' },
  selloBox: { width: '20%', border: '1pt solid #000', justifyContent: 'center', alignItems: 'center' },
  rowText: { marginBottom: 3 },
  bold: { fontWeight: 'bold' },

  table: { width: '100%', border: '1pt solid #000', borderBottom: 0 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e5e5e5', borderBottom: '1pt solid #000' },
  tableRow: { flexDirection: 'row', borderBottom: '1pt solid #000' },
  colDesc: { width: '75%', padding: 5, borderRight: '1pt solid #000' },
  colCost: { width: '25%', padding: 5, textAlign: 'center' },

  pagosBox: { width: '100%', border: '1pt solid #000', borderTop: 0, padding: 5, backgroundColor: '#fafafa' },

  footerSection: { marginTop: 15, flexDirection: 'row', justifyContent: 'space-between' },
  atendidoBox: { width: '45%' },
  totalesBox: { width: '45%', padding: 8 },
  totalesText: { textAlign: 'right', marginBottom: 4, fontSize: 11 },
  firmaBox: { marginTop: 40, width: '45%', borderTop: '1pt solid #000', paddingTop: 4, textAlign: 'center' },
  paymentMethods: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 9, fontWeight: 'bold' }
});

interface FacturaProps { 
  datos: any; 
  usuarioNombre: string; 
}

export function FacturaPDF({ datos, usuarioNombre }: FacturaProps) {
  // Extracción segura
  const numeroFactura = datos?.numeroFactura || datos?.NumeroFactura || '---';
  const fechaDoc = datos?.fechaOrden || datos?.fechaCreacion || datos?.FechaCreacion || new Date().toISOString();
  
  const tasaSegura = Number(datos?.tasaBcv || datos?.TasaBcv) || 0;
  const totalDivisaSeguro = Number(datos?.totalDivisa || datos?.TotalDivisa) || 0;
  const totalBolivares = (totalDivisaSeguro * tasaSegura).toFixed(2);
  
  const detallesSeguros = Array.isArray(datos?.detalles || datos?.Detalles) ? (datos?.detalles || datos?.Detalles) : [];
  const pagosSeguros = Array.isArray(datos?.pagos || datos?.Pagos) ? (datos?.pagos || datos?.Pagos) : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Image src="/img/logo-RIV_CARR.png" style={styles.logo} />
          </View>
          <View style={styles.titleBox}>
            <Text style={styles.labTitle}>LABORATORIO CLÍNICO</Text>
            <Text style={styles.labTitle}>RIV_CARR, C.A.</Text>
          </View>
          <View style={styles.docInfoBox}>
            <Text style={styles.docTitle}>FACTURA</Text>
            <Text>N°: {numeroFactura}</Text>
            <Text>FECHA: {new Date(fechaDoc).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.clientSection}>
          <View style={styles.clientDataBox}>
            <Text style={styles.clientHeader}>DATOS DEL PACIENTE</Text>
            <Text style={styles.rowText}><Text style={styles.bold}>NOMBRE:</Text> {datos?.PacienteNombre || 'Público General'}</Text>
            <Text style={styles.rowText}><Text style={styles.bold}>CÓDIGO (ID):</Text> {datos?.pacienteId || datos?.PacienteId || 'N/A'}</Text>
          </View>
          <View style={styles.selloBox}>
            <Text style={styles.bold}>SELLO</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDesc}><Text style={styles.bold}>DESCRIPCIÓN DEL EXAMEN</Text></View>
            <View style={styles.colCost}><Text style={styles.bold}>IMPORTE (USD)</Text></View>
          </View>
          
          {detallesSeguros.map((det: any, index: number) => {
            const nombreEx = det?.examenNombre || det?.ExamenNombre || 'Examen';
            const costoEx = Number(det?.precioMomentoDivisa || det?.PrecioMomentoDivisa) || 0;
            return (
              <View key={index} style={styles.tableRow} wrap={false}>
                <View style={styles.colDesc}><Text>{nombreEx}</Text></View>
                <View style={styles.colCost}><Text>${costoEx.toFixed(2)}</Text></View>
              </View>
            );
          })}

          {pagosSeguros.length > 0 && (
            <View style={styles.pagosBox}>
              <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>ABONOS REGISTRADOS:</Text>
              {pagosSeguros.map((pago: any, idx: number) => {
                const monto = Number(pago?.monto || pago?.Monto) || 0;
                const ref = pago?.referencia || pago?.Referencia || 'N/A';
                return (
                  <Text key={idx} style={{ fontSize: 9 }}>• Pago recibido: ${monto.toFixed(2)} (Ref: {ref})</Text>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.footerSection}>
          <View style={styles.atendidoBox}>
            <Text style={styles.bold}>CAJERO / OPERADOR</Text>
            <Text style={styles.rowText}>NOMBRE: {usuarioNombre}</Text>
            
            <View style={styles.firmaBox}>
              <Text style={styles.bold}>FIRMA</Text>
            </View>
          </View>
          
          <View style={styles.totalesBox}>
            <Text style={styles.totalesText}><Text style={styles.bold}>TASA BCV APLICADA:</Text> B.S {tasaSegura.toFixed(2)}</Text>
            <Text style={styles.totalesText}><Text style={styles.bold}>TOTAL(VES):</Text> B.S {totalBolivares}</Text>
            <Text style={[styles.totalesText, { fontSize: 13, marginTop: 4 }]}><Text style={styles.bold}>TOTAL USD:</Text> ${totalDivisaSeguro.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.paymentMethods} fixed>
          GRACIAS POR PREFERIR LABORATORIO RIV_CARR. DOCUMENTO EMITIDO ELECTRÓNICAMENTE.
        </Text>
      </Page>
    </Document>
  );
}