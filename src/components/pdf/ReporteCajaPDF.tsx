import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { ReporteCaja } from '../../services/ImpresionesService';

// 1. ESTILOS: Aquí estilizas el PDF igual que CSS, pero usando Flexbox.
const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontFamily: 'Helvetica', 
    backgroundColor: '#ffffff' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 2, 
    borderBottomColor: '#0f172a', 
    paddingBottom: 10, 
    marginBottom: 20 
  },
  logo: { 
    width: 60, // Ajusta según tu imagen
    height: 60 
  },
  titleContainer: { 
    textAlign: 'right' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#0f172a' 
  },
  subtitle: { 
    fontSize: 10, 
    color: '#64748b', 
    marginTop: 4 
  },
  section: { 
    marginBottom: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  textNormal: { 
    fontSize: 10, 
    color: '#334155', 
    marginBottom: 4 
  },
  textBold: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: '#0f172a' 
  },
  table: { 
    width: 'auto', 
    marginTop: 10 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#f1f5f9', 
    borderBottomWidth: 1, 
    borderBottomColor: '#cbd5e1', 
    padding: 8 
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9', 
    padding: 8 
  },
  col1: { width: '70%' },
  col2: { width: '30%', textAlign: 'right' },
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 40, 
    right: 40, 
    textAlign: 'center', 
    fontSize: 8, 
    color: '#94a3b8', 
    borderTopWidth: 1, 
    borderColor: '#e2e8f0', 
    paddingTop: 10 
  }
});

interface ReporteCajaPDFProps {
  reporte: ReporteCaja;
  usuarioNombre: string;
}

// 2. EL DOCUMENTO: Usamos las etiquetas especiales de la librería
export function ReporteCajaPDF({ reporte, usuarioNombre }: ReporteCajaPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ENCABEZADO CON LOGO */}
        <View style={styles.header}>
          {/* Asegúrate de poner una imagen real en tu carpeta public */}
          <Image src="/assets/img/logo-biolab.png" style={styles.logo} />
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>LABORATORIO RIV_CARR</Text>
            <Text style={styles.subtitle}>Cierre y Totalización de Caja</Text>
          </View>
        </View>

        {/* INFORMACIÓN DEL REPORTE */}
        <View style={styles.section}>
          <View>
            <Text style={styles.textNormal}><Text style={styles.textBold}>Periodo:</Text> {reporte.rango.inicio} al {reporte.rango.fin}</Text>
            <Text style={styles.textNormal}><Text style={styles.textBold}>Órdenes Procesadas:</Text> {reporte.totalOrdenes}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.textNormal}><Text style={styles.textBold}>Generado:</Text> {new Date().toLocaleDateString()}</Text>
            <Text style={styles.textNormal}><Text style={styles.textBold}>Usuario:</Text> {usuarioNombre}</Text>
          </View>
        </View>
    
        {/* TABLA DE DESGLOSE */}
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginTop: 10 }}>Desglose por Método de Pago</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.col1}><Text style={styles.textBold}>Método de Pago</Text></View>
            <View style={styles.col2}><Text style={styles.textBold}>Monto (USD)</Text></View>
          </View>
          
          {reporte.desglosePorMetodo.map((metodo, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.col1}><Text style={styles.textNormal}>{metodo.nombre}</Text></View>
              <View style={styles.col2}><Text style={styles.textNormal}>${metodo.montoTotal.toFixed(2)}</Text></View>
            </View>
          ))}
        </View>

        {/* TOTALES */}
        <View style={{ marginTop: 20, alignItems: 'flex-end' }}>
          <View style={{ width: '40%', backgroundColor: '#f8fafc', padding: 10, borderRadius: 4 }}>
            <Text style={{ fontSize: 10, marginBottom: 5 }}>Facturado (VES): Bs. {reporte.totalFacturadoBs.toFixed(2)}</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>TOTAL USD: ${reporte.totalFacturadoDivisa.toFixed(2)}</Text>
          </View>
        </View>

        {/* FIRMAS (Al fondo de la página) */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 100 }}>
           <View style={{ borderTopWidth: 1, borderColor: '#000', width: 150, alignItems: 'center', paddingTop: 5 }}>
              <Text style={styles.textBold}>Firma del Cajero</Text>
           </View>
           <View style={{ borderTopWidth: 1, borderColor: '#000', width: 150, alignItems: 'center', paddingTop: 5 }}>
              <Text style={styles.textBold}>Firma del Administrador</Text>
           </View>
        </View>

        <Text style={styles.footer}>
          Documento generado por el sistema automatizado BioLab. Este reporte es de uso interno.
        </Text>
      </Page>
    </Document>
  );
}