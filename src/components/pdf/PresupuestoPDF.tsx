import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';


const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    fontFamily: 'Helvetica', 
    fontSize: 10, 
    color: '#000000',
    backgroundColor: '#ffffff' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  logoBox: { width: '25%' },
  logo: { width: 70, height: 70, objectFit: 'contain' },
  titleBox: { 
    width: '50%', 
    textAlign: 'center', 
    justifyContent: 'center' 
  },
  labTitle: { 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  docInfoBox: { 
    width: '25%', 
    textAlign: 'right', 
    justifyContent: 'center' 
  },
  docTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  clientSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 15 
  },
  clientDataBox: { 
    width: '75%', 
    border: '1pt solid #000', 
    padding: 8 
  },
  clientHeader: { 
    fontWeight: 'bold', 
    borderBottom: '1pt solid #000', 
    paddingBottom: 4, 
    marginBottom: 4,
    textAlign: 'center'
  },
  selloBox: { 
    width: '20%', 
    border: '1pt solid #000', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  rowText: { marginBottom: 3 },
  bold: { fontWeight: 'bold' },
  table: { 
    width: '100%', 
    border: '1pt solid #000', 
    borderBottom: 0 
  },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#e5e5e5', 
    borderBottom: '1pt solid #000'
  },
  tableRow: { 
    flexDirection: 'row', 
    borderBottom: '1pt solid #000' 
  },
  colDesc: { 
    width: '75%', 
    padding: 5, 
    borderRight: '1pt solid #000' 
  },
  colCost: { 
    width: '25%', 
    padding: 5, 
    textAlign: 'center' 
  },
  footerSection: { 
    marginTop: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  atendidoBox: { width: '45%' },
  totalesBox: { 
    width: '45%', 
    padding: 8 
  },
  totalesText: { 
    textAlign: 'right', 
    marginBottom: 4,
    fontSize: 11
  },
  firmaBox: { 
    marginTop: 40, 
    width: '45%', 
    borderTop: '1pt solid #000', 
    paddingTop: 4, 
    textAlign: 'center' 
  },
  paymentMethods: { 
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center', 
    fontSize: 9, 
    fontWeight: 'bold' 
  }
});

interface PresupuestoProps { 
  datos: {
    numeroPresupuesto?: string;
    fecha?: string;
    cliente?: string;
    clienteNombre?: string;
    clienteCedula?: string;
    clienteTelefono?: string;
    tasaBcv?: number;
    totalBolivares?: number;
    totalDivisa?: number;
    examenes?: Array<{ NombreExamen?: string; nombreExamen?: string; CostoEnDivisa?: number; costoEnDivisa?: number; }>;
  }; 
  usuarioNombre: string;

}

export function PresupuestoPDF({ datos, usuarioNombre }: PresupuestoProps) {
  // --- EXTRACCIÓN SEGURA (Evita el TypeError de .toFixed) ---
  const numeroDoc = datos?.numeroPresupuesto || '000001';
  const fechaDoc = datos?.fecha ? new Date(datos.fecha).toLocaleDateString() : new Date().toLocaleDateString();
  const nombreCliente = datos?.clienteNombre || datos?.cliente || 'Público General';
  
  // Parseamos los números garantizando un fallback a 0 si vienen undefined
  const tasaSegura = Number(datos?.tasaBcv) || 0;
  const totalBolivaresSeguro = Number(datos?.totalBolivares) || 0;
  const totalDivisaSeguro = Number(datos?.totalDivisa) || 0;
  const examenesSeguros = Array.isArray(datos?.examenes) ? datos.examenes : [];

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
            <Text style={styles.docTitle}>PRESUPUESTO</Text>
            <Text>N°: {numeroDoc}</Text>
            <Text>FECHA: {fechaDoc}</Text>
          </View>
        </View>

        {/* DATOS DEL CLIENTE Y SELLO */}
        <View style={styles.clientSection}>
          <View style={styles.clientDataBox}>
            <Text style={styles.clientHeader}>DATOS DEL CLIENTE</Text>
            <Text style={styles.rowText}><Text style={styles.bold}>NOMBRE:</Text> {nombreCliente}</Text>
            <Text style={styles.rowText}><Text style={styles.bold}>C.I:</Text> {datos?.clienteCedula || 'N/A'}</Text>
            <Text style={styles.rowText}><Text style={styles.bold}>TELÉFONO:</Text> {datos?.clienteTelefono || 'N/A'}</Text>
          </View>
          <View style={styles.selloBox}>
            <Text style={styles.bold}>SELLO</Text>
          </View>
        </View>

        {/* TABLA DE EXÁMENES */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDesc}><Text style={styles.bold}>DESCRIPCIÓN DEL EXAMEN</Text></View>
            <View style={styles.colCost}><Text style={styles.bold}>COSTO(USD)</Text></View>
          </View>
          
          {examenesSeguros.map((ex, index) => {
            // Extracción soportando tanto camelCase (nuevo) como PascalCase (antiguo)
            const nombreEx = ex?.nombreExamen || ex?.NombreExamen || 'Examen';
            const costoEx = Number(ex?.costoEnDivisa || ex?.CostoEnDivisa) || 0;

            return (
              <View key={index} style={styles.tableRow} wrap={false}>
                <View style={styles.colDesc}><Text>{nombreEx}</Text></View>
                <View style={styles.colCost}><Text>${costoEx.toFixed(2)}</Text></View>
              </View>
            );
          })}
        </View>

        {/* TOTALES Y FIRMAS */}
        <View style={styles.footerSection}>
          <View style={styles.atendidoBox}>
            <Text style={styles.bold}>ATENDIDO POR</Text>
            <Text style={styles.rowText}>NOMBRE: {usuarioNombre}</Text>
            
            
            <View style={styles.firmaBox}>
              <Text style={styles.bold}>FIRMA</Text>
            </View>
          </View>
          
          <View style={styles.totalesBox}>
            <Text style={styles.totalesText}><Text style={styles.bold}>TASA BCV REFERENCIAL:</Text> B.S {tasaSegura.toFixed(2)}</Text>
            <Text style={styles.totalesText}><Text style={styles.bold}>TOTAL(VES):</Text> B.S {totalBolivaresSeguro.toFixed(2)}</Text>
            <Text style={[styles.totalesText, { fontSize: 13, marginTop: 4 }]}><Text style={styles.bold}>TOTAL USD:</Text> ${totalDivisaSeguro.toFixed(2)}</Text>
          </View>
        </View>

        {/* MÉTODOS DE PAGO */}
        <Text style={styles.paymentMethods} fixed>
          METODOS DE PAGO: PAGO MOVIL, TRANSFERENCIA, EFECTIVO Y CASHEA
        </Text>
        
      </Page>
    </Document>
  );
}