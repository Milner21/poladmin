import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { UsuarioReporte, ColumnaReporte } from "@dto/reportes.types";

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 40,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 5,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginTop: 3,
  },
  infoLabel: {
    fontSize: 9,
    color: "#64748b",
    width: 80,
  },
  infoValue: {
    fontSize: 9,
    color: "#1e293b",
  },
  // Estilos para página de estadísticas
  statsPage: {
    fontSize: 10,
    padding: 40,
    backgroundColor: "#ffffff",
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  statsSection: {
    marginBottom: 25,
  },
  statsSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
  },
  statsRowOdd: {
    backgroundColor: "#f8fafc",
  },
  statsLabel: {
    fontSize: 9,
    color: "#374151",
  },
  statsValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
  },
  // Estilos para tabla principal
  table: {
    marginTop: 20,
    border: 1,
    borderColor: "#e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: "#cbd5e1",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    minHeight: 24,
  },
  tableRowOdd: {
    backgroundColor: "#fafafa",
  },
  cellHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#374151",
    flex: 1,
    textAlign: "left",
    paddingRight: 4,
  },
  cellHeaderWithBorder: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#374151",
    flex: 1,
    textAlign: "left",
    paddingRight: 4,
    borderRightWidth: 0.5,
    borderRightColor: "#cbd5e1",
  },
  cell: {
    fontSize: 8,
    color: "#1e293b",
    flex: 1,
    textAlign: "left",
    paddingRight: 4,
    paddingVertical: 2,
  },
  cellWithBorder: {
    fontSize: 8,
    color: "#1e293b",
    flex: 1,
    textAlign: "left",
    paddingRight: 4,
    paddingVertical: 2,
    borderRightWidth: 0.25,
    borderRightColor: "#e2e8f0",
  },
  // Estilos para agrupación por nivel
  groupHeader: {
    backgroundColor: "#e2e8f0",
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginTop: 5,
  },
  groupTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
  },
  groupSubtitle: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  footerText: {
    fontSize: 8,
    color: "#64748b",
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "right",
  },
});

interface ReporteUsuariosPDFProps {
  datos: {
    usuarios: UsuarioReporte[];
    total: number;
    filtros_aplicados: Record<string, unknown>;
  };
  columnas: ColumnaReporte[];
  configuracion: {
    campana: string;
    generadoPor: string;
    agruparPorNivel?: boolean;
    incluirEstadisticas?: boolean;
  };
}

export const ReporteUsuariosPDF = ({
  datos,
  columnas,
  configuracion,
}: ReporteUsuariosPDFProps) => {
  const fechaActual = new Date().toLocaleDateString("es-PY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const columnasVisibles = columnas.filter((col) => col.enabled);

  const getCellValue = (
    usuario: UsuarioReporte,
    columnaKey: string,
    index: number,
  ): string => {
    switch (columnaKey) {
      case "nro":
        return String(index + 1);
      case "nombre":
        return usuario.nombre;
      case "apellido":
        return usuario.apellido;
      case "username":
        return usuario.username;
      case "documento":
        return usuario.documento;
      case "telefono":
        return usuario.telefono || "-";
      case "perfil":
        return usuario.perfil;
      case "nivel":
        return usuario.nivel || "Sin nivel";
      case "candidato_superior":
        return usuario.candidato_superior || "-";
      case "estado":
        return usuario.estado ? "Activo" : "Inactivo";
      case "fecha_registro":
        return new Date(usuario.fecha_registro).toLocaleDateString("es-PY");
      case "total_simpatizantes":
        return String(usuario.total_simpatizantes ?? 0);
      case "total_simpatizantes_red":
        return String(usuario.total_simpatizantes_red ?? 0);
      default:
        return "-";
    }
  };

  const filtrosTexto =
    Object.entries(datos.filtros_aplicados)
      .filter(([, valor]) => valor)
      .map(([clave, valor]) => `${clave}: ${valor}`)
      .join(", ") || "Sin filtros aplicados";

  // Generar estadísticas
  const estadisticas = {
    total: datos.total,
    activos: datos.usuarios.filter((u) => u.estado).length,
    inactivos: datos.usuarios.filter((u) => !u.estado).length,
    porNivel: datos.usuarios.reduce(
      (acc, usuario) => {
        const nivel = usuario.nivel || "Sin nivel";
        acc[nivel] = (acc[nivel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    porPerfil: datos.usuarios.reduce(
      (acc, usuario) => {
        acc[usuario.perfil] = (acc[usuario.perfil] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  // Organizar usuarios (con o sin agrupación)
  const usuariosOrganizados = configuracion.agruparPorNivel
    ? datos.usuarios.reduce(
        (grupos, usuario) => {
          const nivel = usuario.nivel || "Sin nivel asignado";
          const orden = usuario.nivel_orden || 999;
          const key = `${orden}-${nivel}`;
          if (!grupos[key]) grupos[key] = { nivel, orden, usuarios: [] };
          grupos[key].usuarios.push(usuario);
          return grupos;
        },
        {} as Record<
          string,
          { nivel: string; orden: number; usuarios: UsuarioReporte[] }
        >,
      )
    : { todos: { nivel: "Todos", orden: 0, usuarios: datos.usuarios } };

  // Ordenar grupos por orden jerárquico
  const gruposOrdenados = Object.entries(usuariosOrganizados).sort(
    ([, a], [, b]) => a.orden - b.orden,
  );

  return (
    <Document>
      {/* Página de estadísticas (opcional) */}
      {configuracion.incluirEstadisticas && (
        <Page size="A4" style={styles.statsPage}>
          <Text style={styles.statsTitle}>Estadísticas de Usuarios</Text>

          {/* Info del reporte */}
          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>
              Información del Reporte
            </Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Campaña:</Text>
              <Text style={styles.statsValue}>{configuracion.campana}</Text>
            </View>
            <View style={[styles.statsRow, styles.statsRowOdd]}>
              <Text style={styles.statsLabel}>Generado por:</Text>
              <Text style={styles.statsValue}>{configuracion.generadoPor}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Fecha:</Text>
              <Text style={styles.statsValue}>{fechaActual}</Text>
            </View>
          </View>

          {/* Resumen general */}
          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Resumen General</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Total de usuarios:</Text>
              <Text style={styles.statsValue}>{estadisticas.total}</Text>
            </View>
            <View style={[styles.statsRow, styles.statsRowOdd]}>
              <Text style={styles.statsLabel}>Usuarios activos:</Text>
              <Text style={styles.statsValue}>{estadisticas.activos}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Usuarios inactivos:</Text>
              <Text style={styles.statsValue}>{estadisticas.inactivos}</Text>
            </View>
          </View>

          {/* Por nivel */}
          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Distribución por Nivel</Text>
            {Object.entries(estadisticas.porNivel)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([nivel, cantidad], index) => (
                <View
                  key={nivel}
                  style={
                    index % 2 === 1
                      ? [styles.statsRow, styles.statsRowOdd]
                      : styles.statsRow
                  }
                >
                  <Text style={styles.statsLabel}>{nivel}:</Text>
                  <Text style={styles.statsValue}>{cantidad}</Text>
                </View>
              ))}
          </View>

          {/* Por perfil */}
          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>
              Distribución por Perfil
            </Text>
            {Object.entries(estadisticas.porPerfil)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([perfil, cantidad], index) => (
                <View
                  key={perfil}
                  style={
                    index % 2 === 1
                      ? [styles.statsRow, styles.statsRowOdd]
                      : styles.statsRow
                  }
                >
                  <Text style={styles.statsLabel}>{perfil}:</Text>
                  <Text style={styles.statsValue}>{cantidad}</Text>
                </View>
              ))}
          </View>
        </Page>
      )}

      {/* Página principal con datos */}
      <Page
        size="A4"
        orientation={columnasVisibles.length > 6 ? "landscape" : "portrait"}
        style={styles.page}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>POLADMIN</Text>
            <Text style={styles.subtitle}>Sistema de Gestión Política</Text>
          </View>

          <Text style={styles.reportTitle}>Reporte de Usuarios</Text>

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
          {/* Header de tabla */}
          <View style={styles.tableHeader}>
            {columnasVisibles.map((columna, index) => (
              <Text
                key={columna.key}
                style={
                  index < columnasVisibles.length - 1
                    ? styles.cellHeaderWithBorder
                    : styles.cellHeader
                }
              >
                {columna.label}
              </Text>
            ))}
          </View>

          {/* Filas agrupadas */}
          {gruposOrdenados.map(([key, grupo]) => (
            <View key={key}>
              {/* Header del grupo */}
              {configuracion.agruparPorNivel && grupo.nivel !== "Todos" && (
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>{grupo.nivel}</Text>
                  <Text style={styles.groupSubtitle}>
                    {grupo.usuarios.length} usuario
                    {grupo.usuarios.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              )}

              {/* Filas del grupo */}
              {grupo.usuarios.map((usuario, index) => (
                <View
                  key={usuario.id}
                  style={
                    index % 2 === 1
                      ? [styles.tableRow, styles.tableRowOdd]
                      : styles.tableRow
                  }
                >
                  {columnasVisibles.map((columna, colIndex) => (
                    <Text
                      key={columna.key}
                      style={
                        colIndex < columnasVisibles.length - 1
                          ? styles.cellWithBorder
                          : styles.cell
                      }
                    >
                      {getCellValue(usuario, columna.key, index)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total: {datos.total} usuarios</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Página {/* se agrega automáticamente */}
          </Text>
          <Text style={styles.footerText}>poladmin.com.py</Text>
        </View>
      </Page>
    </Document>
  );
};
