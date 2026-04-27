import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type {
  ColumnaReporte,
  ReporteRedJerarquicaResponse,
  UsuarioJerarquico,
} from "@dto/reportes.types";
import type { ReactElement } from "react";

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
    width: 100,
  },
  infoValue: {
    fontSize: 9,
    color: "#1e293b",
  },
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
  cell: {
    fontSize: 8,
    color: "#1e293b",
    flex: 1,
    textAlign: "left",
    paddingRight: 4,
    paddingVertical: 2,
  },
  treeContainer: {
    marginTop: 20,
  },
  treeNode: {
    marginBottom: 8,
  },
  treeNodeLevel0: {
    marginLeft: 0,
    backgroundColor: "#dbeafe",
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  treeNodeLevel1: {
    marginLeft: 15,
    backgroundColor: "#e0f2fe",
    padding: 6,
    borderRadius: 3,
    borderLeftWidth: 2,
    borderLeftColor: "#0ea5e9",
  },
  treeNodeLevel2: {
    marginLeft: 30,
    backgroundColor: "#f0f9ff",
    padding: 5,
    borderRadius: 2,
    borderLeftWidth: 2,
    borderLeftColor: "#38bdf8",
  },
  treeNodeLevel3: {
    marginLeft: 45,
    backgroundColor: "#f8fafc",
    padding: 4,
    borderRadius: 2,
    borderLeftWidth: 1,
    borderLeftColor: "#94a3b8",
  },
  treeNodeDeep: {
    marginLeft: 60,
    backgroundColor: "#ffffff",
    padding: 4,
    borderRadius: 2,
    borderLeftWidth: 1,
    borderLeftColor: "#cbd5e1",
  },
  treeNodeName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  treeNodeInfo: {
    fontSize: 7,
    color: "#64748b",
    marginTop: 1,
  },
  treeNodeBadge: {
    fontSize: 7,
    color: "#059669",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 2,
  },
  treeNodeInactive: {
    fontSize: 7,
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
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

interface ReporteRedJerarquicaPDFProps {
  datos: ReporteRedJerarquicaResponse;
  columnas: ColumnaReporte[];
  configuracion: {
    campana: string;
    generadoPor: string;
    tipoVisualizacion: string;
    nivelDetalle: string;
    incluirEstadisticas: boolean;
    soloActivos: boolean;
  };
}

export const ReporteRedJerarquicaPDF = ({
  datos,
  columnas,
  configuracion,
}: ReporteRedJerarquicaPDFProps) => {
  const fechaActual = new Date().toLocaleDateString("es-PY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const columnasVisibles = columnas.filter((col) => col.enabled);

  const contarSubordinadosRecursivo = (usuario: UsuarioJerarquico): number => {
    if (
      !usuario.subordinados_directos ||
      usuario.subordinados_directos.length === 0
    ) {
      return 0;
    }
    return usuario.subordinados_directos.reduce(
      (total, sub) => total + 1 + contarSubordinadosRecursivo(sub),
      0,
    );
  };

  const getCellValue = (
    usuario: UsuarioJerarquico,
    columnaKey: string,
  ): string => {
    switch (columnaKey) {
      case "nivel":
        return usuario.nivel?.nombre || "Sin nivel";
      case "nombre":
        return usuario.nombre;
      case "apellido":
        return usuario.apellido;
      case "username":
        return usuario.username;
      case "perfil":
        return usuario.perfil.nombre;
      case "candidato_superior":
        return usuario.candidato_superior
          ? `${usuario.candidato_superior.nombre} ${usuario.candidato_superior.apellido}`
          : "-";
      case "total_subordinados":
        return String(contarSubordinadosRecursivo(usuario));
      case "total_simpatizantes":
        return String(usuario.total_simpatizantes ?? 0);
      case "estado":
        return usuario.estado ? "Activo" : "Inactivo";
      default:
        return "-";
    }
  };

  const aplanarArbol = (nodos: UsuarioJerarquico[]): UsuarioJerarquico[] => {
    const resultado: UsuarioJerarquico[] = [];
    const procesar = (usuario: UsuarioJerarquico) => {
      resultado.push(usuario);
      if (
        usuario.subordinados_directos &&
        usuario.subordinados_directos.length > 0
      ) {
        usuario.subordinados_directos.forEach(procesar);
      }
    };
    nodos.forEach(procesar);
    return resultado;
  };

  const renderNodoArbol = (
    usuario: UsuarioJerarquico,
    nivel: number = 0,
  ): ReactElement => {
    const totalSubordinados = contarSubordinadosRecursivo(usuario);

    const getStylePorNivel = () => {
      if (nivel === 0) return styles.treeNodeLevel0;
      if (nivel === 1) return styles.treeNodeLevel1;
      if (nivel === 2) return styles.treeNodeLevel2;
      if (nivel === 3) return styles.treeNodeLevel3;
      return styles.treeNodeDeep;
    };

    return (
      <View key={usuario.id} style={styles.treeNode}>
        <View style={getStylePorNivel()}>
          <Text style={styles.treeNodeName}>
            {usuario.nombre} {usuario.apellido} (@{usuario.username})
          </Text>

          {configuracion.nivelDetalle !== "basico" && (
            <>
              <Text style={styles.treeNodeInfo}>
                {usuario.perfil.nombre} • {usuario.nivel?.nombre || "Sin nivel"}
              </Text>

              {configuracion.nivelDetalle === "completo" && (
                <>
                  {usuario.candidato_superior && (
                    <Text style={styles.treeNodeInfo}>
                      Superior: {usuario.candidato_superior.nombre}{" "}
                      {usuario.candidato_superior.apellido}
                    </Text>
                  )}
                  <Text style={styles.treeNodeInfo}>
                    Subordinados: {totalSubordinados}
                  </Text>
                </>
              )}
            </>
          )}

          {usuario.estado ? (
            <Text style={styles.treeNodeBadge}>Activo</Text>
          ) : (
            <Text style={styles.treeNodeInactive}>Inactivo</Text>
          )}
        </View>

        {usuario.subordinados_directos &&
          usuario.subordinados_directos.length > 0 && (
            <View>
              {usuario.subordinados_directos.map((sub) =>
                renderNodoArbol(sub, nivel + 1),
              )}
            </View>
          )}
      </View>
    );
  };

  return (
    <Document>
      {configuracion.incluirEstadisticas && (
        <Page size="A4" style={styles.statsPage}>
          <Text style={styles.statsTitle}>Estadísticas de Red Jerárquica</Text>

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
            <View style={[styles.statsRow, styles.statsRowOdd]}>
              <Text style={styles.statsLabel}>Tipo de visualización:</Text>
              <Text style={styles.statsValue}>
                {configuracion.tipoVisualizacion === "arbol"
                  ? "Árbol jerárquico"
                  : configuracion.tipoVisualizacion === "tabla"
                    ? "Tabla por niveles"
                    : "Solo estadísticas"}
              </Text>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Resumen General</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Total de usuarios:</Text>
              <Text style={styles.statsValue}>{datos.total_usuarios}</Text>
            </View>
            <View style={[styles.statsRow, styles.statsRowOdd]}>
              <Text style={styles.statsLabel}>Total de niveles:</Text>
              <Text style={styles.statsValue}>{datos.total_niveles}</Text>
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.statsSectionTitle}>Distribución por Nivel</Text>
            {datos.estadisticas_por_nivel.map((stat, index) => (
              <View
                key={stat.nivel}
                style={
                  index % 2 === 1
                    ? [styles.statsRow, styles.statsRowOdd]
                    : styles.statsRow
                }
              >
                <Text style={styles.statsLabel}>{stat.nivel}:</Text>
                <Text style={styles.statsValue}>
                  {stat.total} ({stat.activos} activos, {stat.inactivos}{" "}
                  inactivos)
                </Text>
              </View>
            ))}
          </View>
        </Page>
      )}

      {configuracion.tipoVisualizacion !== "estadisticas" && (
        <Page
          size="A4"
          orientation={
            configuracion.tipoVisualizacion === "tabla" &&
            columnasVisibles.length > 6
              ? "landscape"
              : "portrait"
          }
          style={styles.page}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>POLADMIN</Text>
              <Text style={styles.subtitle}>Sistema de Gestión Política</Text>
            </View>

            <Text style={styles.reportTitle}>
              {configuracion.tipoVisualizacion === "arbol"
                ? "Red Jerárquica - Vista de Árbol"
                : "Red Jerárquica - Vista de Tabla"}
            </Text>

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
          </View>

          {configuracion.tipoVisualizacion === "arbol" ? (
            <View style={styles.treeContainer}>
              {datos.arbol_jerarquico.map((usuario) =>
                renderNodoArbol(usuario, 0),
              )}
            </View>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                {columnasVisibles.map((columna) => (
                  <Text key={columna.key} style={styles.cellHeader}>
                    {columna.label}
                  </Text>
                ))}
              </View>

              {aplanarArbol(datos.arbol_jerarquico).map((usuario, index) => (
                <View
                  key={usuario.id}
                  style={
                    index % 2 === 1
                      ? [styles.tableRow, styles.tableRowOdd]
                      : styles.tableRow
                  }
                >
                  {columnasVisibles.map((columna) => (
                    <Text key={columna.key} style={styles.cell}>
                      {getCellValue(usuario, columna.key)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>
              Total: {datos.total_usuarios} usuarios en {datos.total_niveles}{" "}
              niveles
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>poladmin.com.py</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};
