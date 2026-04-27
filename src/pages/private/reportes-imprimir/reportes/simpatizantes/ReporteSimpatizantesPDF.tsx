import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { SimpatizanteReporte, ColumnaReporte } from '@dto/reportes.types';

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 5,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  infoLabel: {
    fontSize: 9,
    color: '#64748b',
    width: 80,
  },
  infoValue: {
    fontSize: 9,
    color: '#1e293b',
  },
  table: {
    marginTop: 20,
    border: 1,
    borderColor: '#e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: '#cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    minHeight: 20,
  },
  tableRowOdd: {
    backgroundColor: '#fafafa',
  },
  cellHeader: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
    textAlign: 'left',
    paddingRight: 3,
  },
  cellHeaderWithBorder: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
    textAlign: 'left',
    paddingRight: 3,
    borderRightWidth: 0.5,
    borderRightColor: '#cbd5e1',
  },
  cell: {
    fontSize: 7,
    color: '#1e293b',
    flex: 1,
    textAlign: 'left',
    paddingRight: 3,
    paddingVertical: 1,
  },
  cellWithBorder: {
    fontSize: 7,
    color: '#1e293b',
    flex: 1,
    textAlign: 'left',
    paddingRight: 3,
    paddingVertical: 1,
    borderRightWidth: 0.25,
    borderRightColor: '#e2e8f0',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 8,
    color: '#64748b',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  groupHeader: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginTop: 5,
  },
  groupTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e293b',
  },
});

interface ReporteSimpatizantesPDFProps {
  datos: {
    simpatizantes: SimpatizanteReporte[];
    total: number;
    filtros_aplicados: Record<string, unknown>;
  };
  columnas: ColumnaReporte[];
  configuracion: {
    campana: string;
    generadoPor: string;
    agruparPorCandidato?: boolean;
    incluirUbicacion?: boolean;
  };
}

// Mapas de traducción fuera de la función
const INTENCIONES_MAP: Record<string, string> = {
  'SEGURO': 'Seguro',
  'PROBABLE': 'Probable',
  'INDECISO': 'Indeciso',
  'OPOSITOR': 'Opositor'
};

const ORIGENES_MAP: Record<string, string> = {
  'PADRON_INTERNO': 'Padrón Interno',
  'PADRON_GENERAL': 'Padrón General',
  'MANUAL': 'Manual'
};

export const ReporteSimpatizantesPDF = ({ datos, columnas, configuracion }: ReporteSimpatizantesPDFProps) => {
  const fechaActual = new Date().toLocaleDateString('es-PY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Filtrar solo las columnas habilitadas
  const columnasVisibles = columnas.filter(col => col.enabled);

  // Función para obtener el valor de una celda
  const getCellValue = (simpatizante: SimpatizanteReporte, columnaKey: string, index: number): string => {
    switch (columnaKey) {
      case 'nro':
        return String(index + 1);
      case 'nombre':
        return simpatizante.nombre;
      case 'apellido':
        return simpatizante.apellido;
      case 'documento':
        return simpatizante.documento;
      case 'telefono':
        return simpatizante.telefono || '-';
      case 'departamento':
        return simpatizante.departamento || '-';
      case 'distrito':
        return simpatizante.distrito || '-';
      case 'barrio':
        return simpatizante.barrio || '-';
      case 'intencion_voto':
        return INTENCIONES_MAP[simpatizante.intencion_voto] || simpatizante.intencion_voto;
      case 'es_afiliado':
        return simpatizante.es_afiliado ? 'Sí' : 'No';
      case 'necesita_transporte':
        return simpatizante.necesita_transporte ? 'Sí' : 'No';
      case 'origen_registro':
        return ORIGENES_MAP[simpatizante.origen_registro] || simpatizante.origen_registro;
      case 'candidato':
        return simpatizante.candidato || '-';
      case 'registrado_por':
        return simpatizante.registrado_por || '-';
      case 'fecha_registro':
        return new Date(simpatizante.fecha_registro).toLocaleDateString('es-PY');
      case 'tiene_gps':
        return simpatizante.tiene_gps ? 'Sí' : 'No';
      default:
        return '-';
    }
  };

  // Generar filtros aplicados como texto
  const filtrosTexto = Object.entries(datos.filtros_aplicados)
    .filter(([, valor]) => valor)
    .map(([clave, valor]) => `${clave}: ${valor}`)
    .join(', ') || 'Sin filtros aplicados';

  // Agrupar por candidato si está habilitado
  const simpatizantesOrganizados = configuracion.agruparPorCandidato
    ? datos.simpatizantes.reduce((grupos, simpatizante) => {
        const candidato = simpatizante.candidato || 'Sin candidato asignado';
        if (!grupos[candidato]) grupos[candidato] = [];
        grupos[candidato].push(simpatizante);
        return grupos;
      }, {} as Record<string, SimpatizanteReporte[]>)
    : { 'Todos': datos.simpatizantes };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>POLADMIN</Text>
            <Text style={styles.subtitle}>Sistema de Gestión Política</Text>
          </View>
          
          <Text style={styles.reportTitle}>Reporte de Simpatizantes</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Campaña:</Text>
            <Text style={styles.infoValue}>{configuracion.campana}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Generado por:</Text>
            <Text style={styles.infoValue}>{configuracion.generadoPor}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{fechaActual}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Filtros:</Text>
            <Text style={styles.infoValue}>{filtrosTexto}</Text>
          </View>
        </View>

        {/* Tabla */}
        <View style={styles.table}>
          {/* Header de la tabla */}
          <View style={styles.tableHeader}>
            {columnasVisibles.map((columna, index) => (
              <Text 
                key={columna.key} 
                style={index < columnasVisibles.length - 1 ? styles.cellHeaderWithBorder : styles.cellHeader}
              >
                {columna.label}
              </Text>
            ))}
          </View>

          {/* Filas de datos */}
          {Object.entries(simpatizantesOrganizados).map(([grupo, simpatizantes]) => (
            <View key={grupo}>
              {/* Header del grupo si está agrupado */}
              {configuracion.agruparPorCandidato && (
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>
                    {grupo} ({simpatizantes.length} simpatizantes)
                  </Text>
                </View>
              )}

              {/* Filas del grupo */}
              {simpatizantes.map((simpatizante, index) => (
                <View 
                  key={simpatizante.id} 
                  style={index % 2 === 1 ? [styles.tableRow, styles.tableRowOdd] : styles.tableRow}
                >
                  {columnasVisibles.map((columna, colIndex) => (
                    <Text 
                      key={columna.key} 
                      style={colIndex < columnasVisibles.length - 1 ? styles.cellWithBorder : styles.cell}
                    >
                      {getCellValue(simpatizante, columna.key, index)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>
            Total: {datos.total} simpatizantes
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Página {/* se agrega automáticamente */}
          </Text>
          <Text style={styles.footerText}>
            poladmin.com.py
          </Text>
        </View>
      </Page>
    </Document>
  );
};