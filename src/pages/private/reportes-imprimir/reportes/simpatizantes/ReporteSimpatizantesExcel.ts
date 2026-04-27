import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { SimpatizanteReporte, ColumnaReporte } from "@dto/reportes.types";

interface GenerarExcelSimpatizantesParams {
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

// Mapas de traducción
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

export const generarExcelSimpatizantes = ({
  datos,
  columnas,
  configuracion,
}: GenerarExcelSimpatizantesParams) => {
  // Filtrar solo columnas habilitadas
  const columnasVisibles = columnas.filter((col) => col.enabled);

  // Función para obtener el valor de una celda
  const getCellValue = (
    simpatizante: SimpatizanteReporte,
    columnaKey: string,
    index: number,
  ): unknown => {
    switch (columnaKey) {
      case "nro":
        return index + 1;
      case "nombre":
        return simpatizante.nombre;
      case "apellido":
        return simpatizante.apellido;
      case "documento":
        return simpatizante.documento;
      case "telefono":
        return simpatizante.telefono || "";
      case "departamento":
        return simpatizante.departamento || "";
      case "distrito":
        return simpatizante.distrito || "";
      case "barrio":
        return simpatizante.barrio || "";
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
        return simpatizante.candidato || "";
      case "registrado_por":
        return simpatizante.registrado_por || "";
      case "fecha_registro":
        return new Date(simpatizante.fecha_registro).toLocaleDateString(
          "es-PY",
        );
      case "tiene_gps":
        return simpatizante.tiene_gps ? "Sí" : "No";
      default:
        return "";
    }
  };

  // Crear workbook
  const workbook = XLSX.utils.book_new();

  // Si está agrupado por candidato, crear múltiples hojas
  if (configuracion.agruparPorCandidato) {
    // Agrupar simpatizantes por candidato
    const simpatizantesPorCandidato = datos.simpatizantes.reduce(
      (grupos, simpatizante) => {
        const candidato = simpatizante.candidato || "Sin candidato asignado";
        if (!grupos[candidato]) grupos[candidato] = [];
        grupos[candidato].push(simpatizante);
        return grupos;
      },
      {} as Record<string, SimpatizanteReporte[]>,
    );

    // Crear hoja resumen
    const resumenData: unknown[][] = [];
    resumenData.push(["POLADMIN - Sistema de Gestión Política"]);
    resumenData.push(["Resumen de Simpatizantes por Candidato"]);
    resumenData.push([]);
    resumenData.push(["Campaña:", configuracion.campana]);
    resumenData.push(["Generado por:", configuracion.generadoPor]);
    resumenData.push(["Fecha:", new Date().toLocaleDateString("es-PY")]);
    resumenData.push([]);
    resumenData.push(["Candidato", "Cantidad de Simpatizantes"]);

    Object.entries(simpatizantesPorCandidato).forEach(
      ([candidato, simpatizantes]) => {
        resumenData.push([candidato, simpatizantes.length]);
      },
    );

    resumenData.push([]);
    resumenData.push(["Total General:", datos.total]);

    const resumenWs = XLSX.utils.aoa_to_sheet(resumenData);
    resumenWs["!cols"] = [{ width: 30 }, { width: 20 }];
    XLSX.utils.book_append_sheet(workbook, resumenWs, "Resumen");

    // Crear hoja para cada candidato
    Object.entries(simpatizantesPorCandidato).forEach(
      ([candidato, simpatizantes]) => {
        const wsData: unknown[][] = [];

        // Información del candidato
        wsData.push([`Simpatizantes de: ${candidato}`]);
        wsData.push(["Cantidad:", simpatizantes.length]);
        wsData.push([]);

        // Headers
        const headers = columnasVisibles.map((col) => col.label);
        wsData.push(headers);

        // Datos
        simpatizantes.forEach((simpatizante, index) => {
          const fila = columnasVisibles.map((col) =>
            getCellValue(simpatizante, col.key, index),
          );
          wsData.push(fila);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(wsData);

        // Configurar anchos de columna
        const colWidths = getColumnWidths(columnasVisibles);
        worksheet["!cols"] = colWidths;

        // Nombre seguro para la hoja (Excel no permite ciertos caracteres)
        const caracteresProhibidos = [":", "\\", "/", "?", "*", "[", "]"];
        let nombreHoja = candidato;
        caracteresProhibidos.forEach((char) => {
          nombreHoja = nombreHoja.replace(new RegExp("\\" + char, "g"), "");
        });
        nombreHoja = nombreHoja.substring(0, 31);
        
        XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
      },
    );
  } else {
    // Crear una sola hoja con todos los datos
    const wsData: unknown[][] = [];

    // Información del reporte
    wsData.push(["POLADMIN - Sistema de Gestión Política"]);
    wsData.push(["Reporte de Simpatizantes"]);
    wsData.push([]);
    wsData.push(["Campaña:", configuracion.campana]);
    wsData.push(["Generado por:", configuracion.generadoPor]);
    wsData.push([
      "Fecha:",
      new Date().toLocaleDateString("es-PY", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]);

    // Filtros aplicados
    const filtrosTexto =
      Object.entries(datos.filtros_aplicados)
        .filter(([, valor]) => valor)
        .map(([clave, valor]) => `${clave}: ${valor}`)
        .join(", ") || "Sin filtros aplicados";
    wsData.push(["Filtros aplicados:", filtrosTexto]);
    wsData.push([]);

    // Headers de la tabla
    const headers = columnasVisibles.map((col) => col.label);
    wsData.push(headers);

    // Datos de simpatizantes
    datos.simpatizantes.forEach((simpatizante, index) => {
      const fila = columnasVisibles.map((col) =>
        getCellValue(simpatizante, col.key, index),
      );
      wsData.push(fila);
    });

    // Fila de total
    wsData.push([]);
    wsData.push([`Total: ${datos.total} simpatizantes`]);

    // Crear worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // Configurar anchos de columna
    const colWidths = getColumnWidths(columnasVisibles);
    worksheet["!cols"] = colWidths;

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Simpatizantes");
  }

  // Generar archivo
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Crear blob y descargar
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fechaArchivo = new Date().toISOString().split("T")[0];
  const nombreArchivo = configuracion.agruparPorCandidato
    ? `simpatizantes-por-candidato-${fechaArchivo}.xlsx`
    : `simpatizantes-${fechaArchivo}.xlsx`;

  saveAs(blob, nombreArchivo);
};

// Función auxiliar para configurar anchos de columnas
function getColumnWidths(columnas: ColumnaReporte[]) {
  return columnas.map((col) => {
    switch (col.key) {
      case "nro":
        return { width: 5 };
      case "nombre":
      case "apellido":
        return { width: 18 };
      case "documento":
        return { width: 12 };
      case "telefono":
        return { width: 15 };
      case "departamento":
      case "distrito":
        return { width: 15 };
      case "barrio":
        return { width: 20 };
      case "intencion_voto":
        return { width: 12 };
      case "es_afiliado":
      case "necesita_transporte":
      case "tiene_gps":
        return { width: 8 };
      case "origen_registro":
        return { width: 15 };
      case "candidato":
      case "registrado_por":
        return { width: 25 };
      case "fecha_registro":
        return { width: 12 };
      default:
        return { width: 15 };
    }
  });
}
