import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { ReporteMorosos } from '../../services/ImpresionesService';

// (Usa el mismo objeto `styles` del componente anterior)
const styles = StyleSheet.create({ /* ... mismo código styles ... */ 
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
  col1: { width: '20%' },
  col2: { width: '40%' },
  col3: { width: '20%' },
  col4: { width: '20%', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTopWidth: 1, borderColor: '#e2e8f0', paddingTop: 10 }
});

interface Props { reporte: ReporteMorosos; usuarioNombre: string; }

export function ReporteMorososPDF({ reporte, usuarioNombre }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src="/assets/img/logo-biolab.png" style={styles.logo} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>LABORATORIO RIV_CARR</Text>
            <Text style={styles.subtitle}>Reporte de Morosidad y Saldos</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View>
            <Text style={styles.textNormal}><Text style={styles.textBold}>Deuda Global Activa:</Text> <Text style={{color: '#e11d48', fontWeight: 'bold'}}>${reporte.totalDeudaDivisa.toFixed(2)}</Text></Text>
          </View>
          <View style={{ textAlign: 'right' }}>
             <Text style={styles.textNormal}><Text style={styles.textBold}>Usuario:</Text> {usuarioNombre}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.col1}><Text style={styles.textBold}>Factura</Text></View>
            <View style={styles.col2}><Text style={styles.textBold}>Paciente</Text></View>
            <View style={styles.col3}><Text style={styles.textBold}>Emisión</Text></View>
            <View style={styles.col4}><Text style={styles.textBold}>Deuda (USD)</Text></View>
          </View>
          {reporte.ordenes.map((o, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={styles.col1}><Text style={styles.textNormal}>{o.numeroFactura}</Text></View>
              <View style={styles.col2}><Text style={styles.textNormal}>{o.pacienteNombre}</Text></View>
              <View style={styles.col3}><Text style={styles.textNormal}>{new Date(o.fechaEmision).toLocaleDateString()}</Text></View>
              <View style={styles.col4}><Text style={styles.textNormal}>${o.deudaPendiente.toFixed(2)}</Text></View>
            </View>
          ))}
        </View>
        <Text style={styles.footer} fixed>Documento generado por el sistema automatizado BioLab.</Text>
      </Page>
    </Document>
  );
}