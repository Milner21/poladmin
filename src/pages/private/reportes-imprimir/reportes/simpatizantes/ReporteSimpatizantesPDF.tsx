// src/pages/private/reportes-imprimir/reportes/simpatizantes/ReporteSimpatizantesPDF.tsx

import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { SimpatizanteReporte, ColumnaReporte } from "@dto/reportes.types";
import { formatearTelefono } from "@utils/telefono";
import { pdfStyles } from "../../styles/pdfStyles";
import { formatearFiltrosAplicados } from "../../utils/filtrosReporte";

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
    candidatoNombre?: string;
    registradorNombre?: string;
    agruparPorCandidato?: boolean;
    incluirUbicacion?: boolean;
    tipoVotacion?: "interna" | "general";
  };
}

const INTENCIONES_MAP: Record<string, string> = {
  SEGURO: "Seguro",
  PROBABLE: "Probable",
  INDECISO: "Indeciso",
  OPOSITOR: "Opositor",
};

const ORIGENES_MAP: Record<string, string> = {
  PADRON_INTERNO: "Padrón Interno",
  PADRON_GENERAL: "Padrón General",
  MANUAL: "Manual",
};

export const ReporteSimpatizantesPDF = ({
  datos,
  columnas,
  configuracion,
}: ReporteSimpatizantesPDFProps) => {
  const fechaActual = new Date().toLocaleDateString("es-PY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const columnasVisibles = columnas.filter((col) => col.enabled);

  const getCellValue = (
    simpatizante: SimpatizanteReporte,
    columnaKey: string,
    index: number,
  ): string => {
    switch (columnaKey) {
      case "nro":
        return String(index + 1);
      case "nombre":
        return simpatizante.nombre;
      case "apellido":
        return simpatizante.apellido;
      case "documento":
        return simpatizante.documento;
      case "telefono":
        return formatearTelefono(simpatizante.telefono);
      case "departamento":
        return simpatizante.departamento || "-";
      case "distrito":
        return simpatizante.distrito || "-";
      case "barrio":
        return simpatizante.barrio || "-";
      case "intencion_voto":
        return (
          INTENCIONES_MAP[simpatizante.intencion_voto] ||
          simpatizante.intencion_voto
        );
      case "es_afiliado":
        return simpatizante.es_afiliado ? "Sí" : "No";
      case "necesita_transporte":
        return simpatizante.necesita_transporte ? "Sí" : "No";
      case "origen_registro":
        return (
          ORIGENES_MAP[simpatizante.origen_registro] ||
          simpatizante.origen_registro
        );
      case "candidato":
        return simpatizante.candidato || "-";
      case "registrado_por":
        return simpatizante.registrado_por || "-";
      case "fecha_registro":
        return new Date(simpatizante.fecha_registro).toLocaleDateString(
          "es-PY",
        );
      case "tiene_gps":
        return simpatizante.tiene_gps ? "Sí" : "No";
      case "local_votacion":
        return configuracion.tipoVotacion === "interna"
          ? simpatizante.local_votacion_interna || "-"
          : simpatizante.local_votacion_general || "-";
      case "mesa_votacion":
        return configuracion.tipoVotacion === "interna"
          ? simpatizante.mesa_votacion_interna || "-"
          : simpatizante.mesa_votacion_general || "-";
      case "orden_votacion":
        return configuracion.tipoVotacion === "interna"
          ? simpatizante.orden_votacion_interna || "-"
          : simpatizante.orden_votacion_general || "-";
      default:
        return "-";
    }
  };

  const filtrosTexto = formatearFiltrosAplicados(datos.filtros_aplicados);

  // Agrupar por candidato si está habilitado
  const simpatizantesOrganizados = configuracion.agruparPorCandidato
    ? datos.simpatizantes.reduce(
        (grupos, simpatizante) => {
          const candidato = simpatizante.candidato || "Sin candidato asignado";
          if (!grupos[candidato]) grupos[candidato] = [];
          grupos[candidato].push(simpatizante);
          return grupos;
        },
        {} as Record<string, SimpatizanteReporte[]>,
      )
    : { Todos: datos.simpatizantes };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.logoContainer}>
            <Text style={pdfStyles.logoText}>POLADMIN</Text>
            <Text style={pdfStyles.subtitle}>Sistema de Gestión Política</Text>
          </View>

          <Text style={pdfStyles.reportTitle}>Reporte de Simpatizantes</Text>

          <View style={pdfStyles.infoRow}>
            <Text style={pdfStyles.infoLabel}>Campaña:</Text>
            <Text style={pdfStyles.infoValue}>{configuracion.campana}</Text>
          </View>

          {configuracion.candidatoNombre && (
            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Usuario:</Text>
              <Text style={pdfStyles.infoValue}>
                {configuracion.candidatoNombre}
              </Text>
            </View>
          )}

          {configuracion.registradorNombre && (
            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Registrado por:</Text>
              <Text style={pdfStyles.infoValue}>
                {configuracion.registradorNombre}
              </Text>
            </View>
          )}

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

        {(configuracion.candidatoNombre || configuracion.registradorNombre) && (
          <View
            style={{
              marginBottom: 6,
              paddingVertical: 4,
              paddingHorizontal: 6,
              backgroundColor: "#f3f4f6",
              borderRadius: 3,
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "bold", color: "#1f2937" }}>
              Registros de:{" "}
              {configuracion.candidatoNombre || configuracion.registradorNombre}
            </Text>
          </View>
        )}

        {/* Tabla */}
        <View style={pdfStyles.table}>
          {/* Header de la tabla */}
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

          {/* Filas de datos */}
          {Object.entries(simpatizantesOrganizados).map(
            ([grupo, simpatizantes]) => (
              <View key={grupo}>
                {/* Header del grupo si está agrupado */}
                {configuracion.agruparPorCandidato && (
                  <View style={pdfStyles.groupHeader}>
                    <Text style={pdfStyles.groupTitle}>
                      {grupo} ({simpatizantes.length} simpatizantes)
                    </Text>
                  </View>
                )}

                {/* Filas del grupo */}
                {simpatizantes.map((simpatizante, index) => (
                  <View
                    key={simpatizante.id}
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
                        {getCellValue(simpatizante, columna.key, index)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            ),
          )}
        </View>

        {/* Total */}
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalText}>
            Total: {datos.total ?? datos.simpatizantes?.length ?? 0}{" "}
            simpatizantes
          </Text>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>
            Documento emitido por Poladmin
          </Text>
          <Text style={pdfStyles.footerText}>www.poladmin.es</Text>
        </View>
      </Page>
    </Document>
  );
};
