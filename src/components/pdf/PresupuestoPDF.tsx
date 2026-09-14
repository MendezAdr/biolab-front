import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({ /* ... mismo código styles general ... */ 
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

interface Props { datos: any; usuarioNombre: string; }

export function PresupuestoPDF({ datos, usuarioNombre }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src="/assets/img/logo-biolab.png" style={styles.logo} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>LABORATORIO RIV_CARR</Text>
            <Text style={styles.subtitle}>Presupuesto de Servicios Analíticos</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View>
            <Text style={styles.textNormal}><Text style={styles.textBold}>Cliente:</Text> {datos.cliente}</Text>
            <Text style={styles.textNormal}><Text style={styles.textBold}>Tasa BCV Referencial:</Text> Bs. {datos.tasaBcv.toFixed(2)}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
             <Text style={styles.textNormal}><Text style={styles.textBold}>Emisión:</Text> {new Date(datos.fecha).toLocaleDateString()}</Text>
             <Text style={styles.textNormal}><Text style={styles.textBold}>Atendido por:</Text> {usuarioNombre}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.col1}><Text style={styles.textBold}>Descripción del Examen</Text></View>
            <View style={styles.col2}><Text style={styles.textBold}>Costo (USD)</Text></View>
          </View>
          {datos.examenes.map((ex: any, index: number) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={styles.col1}><Text style={styles.textNormal}>{ex.NombreExamen}</Text></View>
              <View style={styles.col2}><Text style={styles.textNormal}>${ex.CostoEnDivisa.toFixed(2)}</Text></View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 20, alignItems: 'flex-end' }}>
          <View style={{ width: '40%', backgroundColor: '#f8fafc', padding: 10, borderRadius: 4 }}>
            <Text style={{ fontSize: 10, marginBottom: 5 }}>Total (VES): Bs. {datos.totalBolivares.toFixed(2)}</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>TOTAL USD: ${datos.totalDivisa.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>* Este documento es de carácter informativo y válido por 24 horas. No representa un comprobante fiscal.</Text>
      </Page>
    </Document>
  );
}