import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { ReporteMorosos } from '../../services/ImpresionesService';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 10, color: '#000000', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  logoBox: { width: '25%' },
  logo: { width: 70, height: 70, objectFit: 'contain' },
  titleBox: { width: '50%', textAlign: 'center', justifyContent: 'center' },
  labTitle: { fontSize: 14, fontWeight: 'bold' },
  docInfoBox: { width: '25%', textAlign: 'right', justifyContent: 'center' },
  docTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  
  infoSection: { border: '1pt solid #000', padding: 8, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between' },
  rowText: { marginBottom: 3 },
  bold: { fontWeight: 'bold' },

  table: { width: '100%', border: '1pt solid #000', borderBottom: 0 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#e5e5e5', borderBottom: '1pt solid #000' },
  tableRow: { flexDirection: 'row', borderBottom: '1pt solid #000' },
  col1: { width: '25%', padding: 5, borderRight: '1pt solid #000' },
  col2: { width: '35%', padding: 5, borderRight: '1pt solid #000' },
  col3: { width: '20%', padding: 5, borderRight: '1pt solid #000' },
  col4: { width: '20%', padding: 5, textAlign: 'center' },

  footerText: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 9, fontWeight: 'bold' }
});

interface Props { reporte: ReporteMorosos; usuarioNombre: string; }

export function ReporteMorososPDF({ reporte, usuarioNombre }: Props) {
  const deudaSegura = Number(reporte?.totalDeudaDivisa) || 0;
  const ordenesSeguras = Array.isArray(reporte?.ordenes) ? reporte.ordenes : [];

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
            <Text style={styles.docTitle}>REPORTE</Text>
            <Text>MOROSIDAD Y SALDOS</Text>
            <Text>FECHA: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View>
            <Text style={styles.rowText}><Text style={styles.bold}>DEUDA GLOBAL ACTIVA:</Text> ${deudaSegura.toFixed(2)}</Text>
            <Text style={styles.rowText}><Text style={styles.bold}>CANTIDAD DE ÓRDENES:</Text> {ordenesSeguras.length}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.rowText}><Text style={styles.bold}>GENERADO POR:</Text> {usuarioNombre}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.col1}><Text style={styles.bold}>FACTURA N°</Text></View>
            <View style={styles.col2}><Text style={styles.bold}>PACIENTE</Text></View>
            <View style={styles.col3}><Text style={styles.bold}>EMISIÓN</Text></View>
            <View style={styles.col4}><Text style={styles.bold}>DEUDA (USD)</Text></View>
          </View>
          
          {ordenesSeguras.map((o: any, index: number) => {
            const deudaIndividual = Number(o.deudaPendiente) || 0;
            return (
              <View key={index} style={styles.tableRow} wrap={false}>
                <View style={styles.col1}><Text>{o.numeroFactura || 'N/A'}</Text></View>
                <View style={styles.col2}><Text>{o.pacienteNombre || 'Desconocido'}</Text></View>
                <View style={styles.col3}><Text>{o.fechaEmision ? new Date(o.fechaEmision).toLocaleDateString() : '---'}</Text></View>
                <View style={styles.col4}><Text>${deudaIndividual.toFixed(2)}</Text></View>
              </View>
            );
          })}
        </View>

        <Text style={styles.footerText} fixed>
          DOCUMENTO DE USO INTERNO - SISTEMA AUTOMATIZADO BIOLAB
        </Text>
      </Page>
    </Document>
  );
}