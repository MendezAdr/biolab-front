import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { ReporteCaja } from '../../services/ImpresionesService';

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
  col1: { width: '60%', padding: 5, borderRight: '1pt solid #000' },
  col2: { width: '40%', padding: 5, textAlign: 'center' },

  totalesBox: { marginTop: 15, width: '40%', alignSelf: 'flex-end', border: '1pt solid #000', padding: 8 },
  totalesText: { textAlign: 'right', marginBottom: 4, fontSize: 11 },

  firmasContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 80 },
  firmaBox: { width: '35%', borderTop: '1pt solid #000', paddingTop: 4, textAlign: 'center' },

  footerText: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 9, fontWeight: 'bold' }
});

interface Props { reporte: ReporteCaja; usuarioNombre: string; }

export function ReporteCajaPDF({ reporte, usuarioNombre }: Props) {
  const desgloseSeguro = Array.isArray(reporte?.desglosePorMetodo) ? reporte.desglosePorMetodo : [];
  const totalFacturadoDivisa = Number(reporte?.totalFacturadoDivisa) || 0;
  const totalFacturadoBs = Number(reporte?.totalFacturadoBs) || 0;

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
            <Text style={styles.docTitle}>CIERRE DE CAJA</Text>
            <Text>FECHA: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View>
            <Text style={styles.rowText}><Text style={styles.bold}>PERIODO:</Text> {reporte?.rango?.inicio || 'N/A'} al {reporte?.rango?.fin || 'N/A'}</Text>
            <Text style={styles.rowText}><Text style={styles.bold}>ÓRDENES PROCESADAS:</Text> {reporte?.totalOrdenes || 0}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.rowText}><Text style={styles.bold}>CAJERO:</Text> {usuarioNombre}</Text>
          </View>
        </View>

        <Text style={[styles.bold, { marginBottom: 5 }]}>DESGLOSE DE INGRESOS POR MÉTODO DE PAGO</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.col1}><Text style={styles.bold}>MÉTODO DE PAGO</Text></View>
            <View style={styles.col2}><Text style={styles.bold}>MONTO (USD)</Text></View>
          </View>
          
          {desgloseSeguro.map((metodo: any, index: number) => {
            const monto = Number(metodo.montoTotal) || 0;
            return (
              <View key={index} style={styles.tableRow} wrap={false}>
                <View style={styles.col1}><Text>{metodo.nombre}</Text></View>
                <View style={styles.col2}><Text>${monto.toFixed(2)}</Text></View>
              </View>
            );
          })}
        </View>

        <View style={styles.totalesBox}>
          <Text style={styles.totalesText}><Text style={styles.bold}>TOTAL (VES):</Text> B.S {totalFacturadoBs.toFixed(2)}</Text>
          <Text style={[styles.totalesText, { fontSize: 13, marginTop: 4 }]}><Text style={styles.bold}>TOTAL (USD):</Text> ${totalFacturadoDivisa.toFixed(2)}</Text>
        </View>

        <View style={styles.firmasContainer}>
           <View style={styles.firmaBox}>
              <Text style={styles.bold}>FIRMA DEL CAJERO</Text>
           </View>
           <View style={styles.firmaBox}>
              <Text style={styles.bold}>FIRMA DEL ADMINISTRADOR</Text>
           </View>
        </View>

        <Text style={styles.footerText} fixed>
          DOCUMENTO DE CONTROL INTERNO - SISTEMA AUTOMATIZADO BIOLAB
        </Text>
      </Page>
    </Document>
  );
}