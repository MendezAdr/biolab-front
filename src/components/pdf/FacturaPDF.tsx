import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#0f172a', paddingBottom: 10, marginBottom: 20 },
  logo: { width: 60, height: 60 },
  titleContainer: { textAlign: 'right' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 10, color: '#64748b', marginTop: 4 },
  section: { marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between' },
  textNormal: { fontSize: 10, color: '#334155', marginBottom: 4 },
  textBold: { fontSize: 10, fontWeight: 'bold', color: '#0f172a' },
  table: { width: 'auto', marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', padding: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', padding: 8 },
  col1: { width: '70%' },
  col2: { width: '30%', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTopWidth: 1, borderColor: '#e2e8f0', paddingTop: 10 }
});

interface Props { 
  datos: any; 
  usuarioNombre: string; 
}

export function FacturaPDF({ datos, usuarioNombre }: Props) {
  // Verificación de seguridad y cálculos
  const fechaSegura = datos?.FechaCreacion || datos?.Fecha || new Date().toISOString();
  const tasaSegura = datos?.TasaBcv || 0;
  const totalDivisaSeguro = datos?.TotalDivisa || 0;
  
  // Calculamos el equivalente en VES en tiempo real
  const totalBolivares = (totalDivisaSeguro * tasaSegura).toFixed(2);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ENCABEZADO */}
        <View style={styles.header}>
          {/* Si tienes el logo, descomenta la siguiente línea y asegúrate de que la ruta sea correcta */}
          {/* <Image src="/assets/img/logo-biolab.png" style={styles.logo} /> */}
          <View style={{ width: 60, height: 60, backgroundColor: '#f1f5f9', borderRadius: 8 }} />
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>LABORATORIO RIV_CARR</Text>
            {/* Mostramos el número oficial de factura devuelto por el backend */}
            <Text style={styles.subtitle}>Factura Oficial N° {datos?.NumeroFactura || '---'}</Text>
          </View>
        </View>

        {/* DATOS GENERALES */}
        <View style={styles.section}>
          <View>
            <Text style={styles.textNormal}><Text style={styles.textBold}>ID Paciente:</Text> {datos?.PacienteId}</Text>
            <Text style={styles.textNormal}><Text style={styles.textBold}>Tasa BCV Aplicada:</Text> Bs. {tasaSegura.toFixed(2)}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
             <Text style={styles.textNormal}><Text style={styles.textBold}>Emisión:</Text> {new Date(fechaSegura).toLocaleDateString()}</Text>
             <Text style={styles.textNormal}><Text style={styles.textBold}>Cajero:</Text> {usuarioNombre}</Text>
          </View>
        </View>

        {/* TABLA DE EXÁMENES (Detalles) */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.col1}><Text style={styles.textBold}>Descripción del Examen</Text></View>
            <View style={styles.col2}><Text style={styles.textBold}>Importe (USD)</Text></View>
          </View>
          {datos?.Detalles?.map((det: any, index: number) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={styles.col1}><Text style={styles.textNormal}>{det.ExamenNombre}</Text></View>
              <View style={styles.col2}><Text style={styles.textNormal}>${det.PrecioMomentoDivisa?.toFixed(2)}</Text></View>
            </View>
          ))}
        </View>

        {/* REGISTRO DE PAGOS (Opcional, pero muy útil en facturas) */}
        {datos?.Pagos && datos.Pagos.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4, marginBottom: 6 }}>
              Registro de Pagos Recibidos
            </Text>
            {datos.Pagos.map((pago: any, idx: number) => (
              <Text key={idx} style={{ fontSize: 9, color: '#64748b', marginBottom: 2 }}>
                • Abono: ${pago.Monto?.toFixed(2)} (Ref: {pago.Referencia || 'N/A'})
              </Text>
            ))}
          </View>
        )}

        {/* TOTALIZACIÓN */}
        <View style={{ marginTop: 20, alignItems: 'flex-end' }}>
          <View style={{ width: '40%', backgroundColor: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <Text style={{ fontSize: 10, marginBottom: 5, color: '#64748b' }}>Total (VES): Bs. {totalBolivares}</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>TOTAL USD: ${totalDivisaSeguro.toFixed(2)}</Text>
          </View>
        </View>

        {/* PIE DE PÁGINA OFICIAL */}
        <Text style={styles.footer} fixed>
          Gracias por confiar en Laboratorio RIV_CARR. Documento generado electrónicamente.
        </Text>
      </Page>
    </Document>
  );
}