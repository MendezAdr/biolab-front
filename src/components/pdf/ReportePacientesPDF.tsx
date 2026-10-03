import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { ReportePacientes } from '../../services/ImpresionesService';

// Estilos clásicos e institucionales (Blanco y Negro, bordes sólidos)
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
  col1: { width: '40%', padding: 5, borderRight: '1pt solid #000' },
  col2: { width: '30%', padding: 5, borderRight: '1pt solid #000' },
  col3: { width: '30%', padding: 5, textAlign: 'center' },

  footerText: { position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 9, fontWeight: 'bold' }
});

interface Props { reporte: ReportePacientes; usuarioNombre: string; }

export function ReportePacientesPDF({ reporte, usuarioNombre }: Props) {
  // Extracción segura de datos con fallbacks
  const pacientesSeguros = Array.isArray(reporte?.pacientes) ? reporte.pacientes : [];
  const totalPacientes = Number(reporte?.totalPacientes) || pacientesSeguros.length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* ENCABEZADO */}
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
            <Text>DIRECTORIO DE PACIENTES</Text>
            <Text>FECHA: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* INFORMACIÓN DEL REPORTE */}
        <View style={styles.infoSection}>
          <View>
            <Text style={styles.rowText}><Text style={styles.bold}>TOTAL REGISTRADOS:</Text> {totalPacientes}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.rowText}><Text style={styles.bold}>GENERADO POR:</Text> {usuarioNombre}</Text>
          </View>
        </View>

        {/* TABLA DEL DIRECTORIO */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.col1}><Text style={styles.bold}>NOMBRE COMPLETO</Text></View>
            <View style={styles.col2}><Text style={styles.bold}>CÉDULA</Text></View>
            <View style={styles.col3}><Text style={styles.bold}>TELÉFONO</Text></View>
          </View>
          
          {pacientesSeguros.map((p: any, index: number) => {
            // Lectura tolerante (soporta camelCase y PascalCase)
            const nombre = p?.nombre || p?.Nombre || '';
            const apellido = p?.apellido || p?.Apellido || '';
            const nombreCompleto = `${nombre} ${apellido}`.trim() || 'Desconocido';
            const cedula = p?.cedula || p?.Cedula || 'N/A';
            const telefono = p?.telefono || p?.Telefono || 'N/A';

            return (
              <View key={index} style={styles.tableRow} wrap={false}>
                <View style={styles.col1}><Text>{nombreCompleto}</Text></View>
                <View style={styles.col2}><Text>{cedula}</Text></View>
                <View style={styles.col3}><Text>{telefono}</Text></View>
              </View>
            );
          })}
        </View>

        {/* PIE DE PÁGINA */}
        <Text style={styles.footerText} fixed>
          DOCUMENTO DE USO INTERNO - SISTEMA AUTOMATIZADO BIOLAB
        </Text>
      </Page>
    </Document>
  );
}