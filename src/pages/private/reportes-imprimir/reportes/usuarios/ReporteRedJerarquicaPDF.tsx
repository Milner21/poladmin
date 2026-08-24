// src/pages/private/reportes-imprimir/reportes/usuarios/ReporteRedJerarquicaPDF.tsx

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type {
  ColumnaReporte,
  ReporteRedJerarquicaResponse,
  UsuarioJerarquico,
} from "@dto/reportes.types";
import type { ReactElement } from "react";
import { pdfStyles } from "../../styles/pdfStyles";

// Estilos locales exclusivos para el renderizado del árbol jerárquico
const treeStyles = StyleSheet.create({
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
    alignSelf: "flex-start",
  },
  treeNodeInactive: {
    fontSize: 7,
    color: "#dc2626",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 2,
    alignSelf: "flex-start",
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
  const esHorizontal = configuracion.tipoVisualizacion === "tabla" && columnasVisibles.length > 6;

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
      if (nivel === 0) return treeStyles.treeNodeLevel0;
      if (nivel === 1) return treeStyles.treeNodeLevel1;
      if (nivel === 2) return treeStyles.treeNodeLevel2;
      if (nivel === 3) return treeStyles.treeNodeLevel3;
      return treeStyles.treeNodeDeep;
    };

    return (
      <View key={usuario.id} style={treeStyles.treeNode}>
        <View style={getStylePorNivel()}>
          <Text style={treeStyles.treeNodeName}>
            {usuario.nombre} {usuario.apellido} (@{usuario.username})
          </Text>

          {configuracion.nivelDetalle !== "basico" && (
            <>
              <Text style={treeStyles.treeNodeInfo}>
                {usuario.perfil.nombre} • {usuario.nivel?.nombre || "Sin nivel"}
              </Text>

              {configuracion.nivelDetalle === "completo" && (
                <>
                  {usuario.candidato_superior && (
                    <Text style={treeStyles.treeNodeInfo}>
                      Superior: {usuario.candidato_superior.nombre}{" "}
                      {usuario.candidato_superior.apellido}
                    </Text>
                  )}
                  <Text style={treeStyles.treeNodeInfo}>
                    Subordinados: {totalSubordinados}
                  </Text>
                </>
              )}
            </>
          )}

          {usuario.estado ? (
            <Text style={treeStyles.treeNodeBadge}>Activo</Text>
          ) : (
            <Text style={treeStyles.treeNodeInactive}>Inactivo</Text>
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
      {/* Página de Estadísticas */}
      {configuracion.incluirEstadisticas && (
        <Page size="A4" style={pdfStyles.statsPage}>
          <Text style={pdfStyles.statsTitle}>Estadísticas de Red Jerárquica</Text>

          <View style={pdfStyles.statsSection}>
            <Text style={pdfStyles.statsSectionTitle}>
              Información del Reporte
            </Text>
            <View style={pdfStyles.statsRow}>
              <Text style={pdfStyles.statsLabel}>Campaña:</Text>
              <Text style={pdfStyles.statsValue}>{configuracion.campana}</Text>
            </View>
            <View style={[pdfStyles.statsRow, pdfStyles.statsRowOdd]}>
              <Text style={pdfStyles.statsLabel}>Generado por:</Text>
              <Text style={pdfStyles.statsValue}>{configuracion.generadoPor}</Text>
            </View>
            <View style={pdfStyles.statsRow}>
              <Text style={pdfStyles.statsLabel}>Fecha:</Text>
              <Text style={pdfStyles.statsValue}>{fechaActual}</Text>
            </View>
            <View style={[pdfStyles.statsRow, pdfStyles.statsRowOdd]}>
              <Text style={pdfStyles.statsLabel}>Tipo de visualización:</Text>
              <Text style={pdfStyles.statsValue}>
                {configuracion.tipoVisualizacion === "arbol"
                  ? "Árbol jerárquico"
                  : configuracion.tipoVisualizacion === "tabla"
                    ? "Tabla por niveles"
                    : "Solo estadísticas"}
              </Text>
            </View>
          </View>

          <View style={pdfStyles.statsSection}>
            <Text style={pdfStyles.statsSectionTitle}>Resumen General</Text>
            <View style={pdfStyles.statsRow}>
              <Text style={pdfStyles.statsLabel}>Total de usuarios:</Text>
              <Text style={pdfStyles.statsValue}>{datos.total_usuarios}</Text>
            </View>
            <View style={[pdfStyles.statsRow, pdfStyles.statsRowOdd]}>
              <Text style={pdfStyles.statsLabel}>Total de niveles:</Text>
              <Text style={pdfStyles.statsValue}>{datos.total_niveles}</Text>
            </View>
          </View>

          <View style={pdfStyles.statsSection}>
            <Text style={pdfStyles.statsSectionTitle}>Distribución por Nivel</Text>
            {datos.estadisticas_por_nivel.map((stat, index) => (
              <View
                key={stat.nivel}
                style={
                  index % 2 === 1
                    ? [pdfStyles.statsRow, pdfStyles.statsRowOdd]
                    : pdfStyles.statsRow
                }
              >
                <Text style={pdfStyles.statsLabel}>{stat.nivel}:</Text>
                <Text style={pdfStyles.statsValue}>
                  {stat.total} ({stat.activos} activos, {stat.inactivos}{" "}
                  inactivos)
                </Text>
              </View>
            ))}
          </View>
        </Page>
      )}

      {/* Página de Estructura de Datos */}
      {configuracion.tipoVisualizacion !== "estadisticas" && (
        <Page
          size="A4"
          orientation={esHorizontal ? "landscape" : "portrait"}
          style={esHorizontal ? pdfStyles.page : pdfStyles.pagePortrait}
        >
          <View style={pdfStyles.header}>
            <View style={pdfStyles.logoContainer}>
              <Text style={pdfStyles.logoText}>POLADMIN</Text>
              <Text style={pdfStyles.subtitle}>Sistema de Gestión Política</Text>
            </View>

            <Text style={pdfStyles.reportTitle}>
              {configuracion.tipoVisualizacion === "arbol"
                ? "Red Jerárquica - Vista de Árbol"
                : "Red Jerárquica - Vista de Tabla"}
            </Text>

            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Campaña:</Text>
              <Text style={pdfStyles.infoValue}>{configuracion.campana}</Text>
            </View>

            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Generado por:</Text>
              <Text style={pdfStyles.infoValue}>{configuracion.generadoPor}</Text>
            </View>

            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Fecha:</Text>
              <Text style={pdfStyles.infoValue}>{fechaActual}</Text>
            </View>
          </View>

          {configuracion.tipoVisualizacion === "arbol" ? (
            <View style={treeStyles.treeContainer}>
              {datos.arbol_jerarquico.map((usuario) =>
                renderNodoArbol(usuario, 0),
              )}
            </View>
          ) : (
            <View style={pdfStyles.table}>
              <View style={pdfStyles.tableHeader}>
                {columnasVisibles.map((columna, index) => (
                  <Text
                    key={columna.key}
                    style={
                      index < columnasVisibles.length - 1
                        ? pdfStyles.cellHeaderWithBorder
                        : pdfStyles.cellHeader
                    }
                  >
                    {columna.label}
                  </Text>
                ))}
              </View>

              {aplanarArbol(datos.arbol_jerarquico).map((usuario, index) => (
                <View
                  key={usuario.id}
                  style={
                    index % 2 === 1
                      ? [pdfStyles.tableRow, pdfStyles.tableRowOdd]
                      : pdfStyles.tableRow
                  }
                >
                  {columnasVisibles.map((columna, colIndex) => (
                    <Text
                      key={columna.key}
                      style={
                        colIndex < columnasVisibles.length - 1
                          ? pdfStyles.cellWithBorder
                          : pdfStyles.cell
                      }
                    >
                      {getCellValue(usuario, columna.key)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}

          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalText}>
              Total: {datos.total_usuarios} usuarios en {datos.total_niveles}{" "}
              niveles
            </Text>
          </View>

          <View style={esHorizontal ? pdfStyles.footer : pdfStyles.footerPortrait}>
            <Text style={pdfStyles.footerText}>
              Documento emitido por PolAdmin
            </Text>
            <Text style={pdfStyles.footerText}>poladmin.com.py</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};