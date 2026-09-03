// src/pages/private/reportes-imprimir/reportes/usuarios/ReporteUsuariosPDF.tsx

import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { UsuarioReporte, ColumnaReporte } from "@dto/reportes.types";
import { formatearTelefono } from "@utils/telefono";
import { pdfStyles } from "../../styles/pdfStyles";
import { formatearFiltrosAplicados } from "../../utils/filtrosReporte";

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
  const esHorizontal = columnasVisibles.length > 6;

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
        return formatearTelefono(usuario.telefono);
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
      case "barrios":
        return usuario.barrios || "-";
      default:
        return "-";
    }
  };

  const filtrosTexto = formatearFiltrosAplicados(datos.filtros_aplicados);

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
        <Page size="A4" style={pdfStyles.statsPage}>
          <Text style={pdfStyles.statsTitle}>Estadísticas de Usuarios</Text>

          {/* Info del reporte */}
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
              <Text style={pdfStyles.statsValue}>
                {configuracion.generadoPor}
              </Text>
            </View>
            <View style={pdfStyles.statsRow}>
              <Text style={pdfStyles.statsLabel}>Fecha:</Text>
              <Text style={pdfStyles.statsValue}>{fechaActual}</Text>
            </View>
          </View>

          {/* Resumen general */}
          <View style={pdfStyles.statsSection}>
            <Text style={pdfStyles.statsSectionTitle}>Resumen General</Text>
            <View style={pdfStyles.statsRow}>
              <Text style={pdfStyles.statsLabel}>Total de usuarios:</Text>
              <Text style={pdfStyles.statsValue}>{estadisticas.total}</Text>
            </View>
            <View style={[pdfStyles.statsRow, pdfStyles.statsRowOdd]}>
              <Text style={pdfStyles.statsLabel}>Usuarios activos:</Text>
              <Text style={pdfStyles.statsValue}>{estadisticas.activos}</Text>
            </View>
            <View style={pdfStyles.statsRow}>
              <Text style={pdfStyles.statsLabel}>Usuarios inactivos:</Text>
              <Text style={pdfStyles.statsValue}>{estadisticas.inactivos}</Text>
            </View>
          </View>

          {/* Por nivel */}
          <View style={pdfStyles.statsSection}>
            <Text style={pdfStyles.statsSectionTitle}>
              Distribución por Nivel
            </Text>
            {Object.entries(estadisticas.porNivel)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([nivel, cantidad], index) => (
                <View
                  key={nivel}
                  style={
                    index % 2 === 1
                      ? [pdfStyles.statsRow, pdfStyles.statsRowOdd]
                      : pdfStyles.statsRow
                  }
                >
                  <Text style={pdfStyles.statsLabel}>{nivel}:</Text>
                  <Text style={pdfStyles.statsValue}>{cantidad}</Text>
                </View>
              ))}
          </View>

          {/* Por perfil */}
          <View style={pdfStyles.statsSection}>
            <Text style={pdfStyles.statsSectionTitle}>
              Distribución por Perfil
            </Text>
            {Object.entries(estadisticas.porPerfil)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([perfil, cantidad], index) => (
                <View
                  key={perfil}
                  style={
                    index % 2 === 1
                      ? [pdfStyles.statsRow, pdfStyles.statsRowOdd]
                      : pdfStyles.statsRow
                  }
                >
                  <Text style={pdfStyles.statsLabel}>{perfil}:</Text>
                  <Text style={pdfStyles.statsValue}>{cantidad}</Text>
                </View>
              ))}
          </View>
        </Page>
      )}

      {/* Página principal con datos */}
      <Page
        size="A4"
        orientation={esHorizontal ? "landscape" : "portrait"}
        style={esHorizontal ? pdfStyles.page : pdfStyles.pagePortrait}
      >
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.logoContainer}>
            <Text style={pdfStyles.logoText}>POLADMIN</Text>
            <Text style={pdfStyles.subtitle}>Sistema de Gestión Política</Text>
          </View>

          <Text style={pdfStyles.reportTitle}>Reporte de Usuarios</Text>

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

          <View style={pdfStyles.infoRow}>
            <Text style={pdfStyles.infoLabel}>Filtros:</Text>
            <Text style={pdfStyles.infoValue}>{filtrosTexto}</Text>
          </View>
        </View>

        {/* Tabla */}
        <View style={pdfStyles.table}>
          {/* Header de tabla */}
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

          {/* Filas agrupadas */}
          {gruposOrdenados.map(([key, grupo]) => (
            <View key={key}>
              {/* Header del grupo */}
              {configuracion.agruparPorNivel && grupo.nivel !== "Todos" && (
                <View style={pdfStyles.groupHeader}>
                  <Text style={pdfStyles.groupTitle}>{grupo.nivel}</Text>
                  <Text style={pdfStyles.groupSubtitle}>
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
                      {getCellValue(usuario, columna.key, index)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalText}>Total: {datos.total} usuarios</Text>
        </View>

        {/* Footer */}
        <View
          style={esHorizontal ? pdfStyles.footer : pdfStyles.footerPortrait}
        >
          <Text style={pdfStyles.footerText}>
            Documento emitido por PolAdmin
          </Text>
          <Text style={pdfStyles.footerText}>poladmin.com.py</Text>
        </View>
      </Page>
    </Document>
  );
};
