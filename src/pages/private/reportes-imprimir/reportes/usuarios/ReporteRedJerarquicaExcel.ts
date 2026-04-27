import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type {
  ColumnaReporte,
  ReporteRedJerarquicaResponse,
  UsuarioJerarquico,
} from "@dto/reportes.types";

interface GenerarExcelRedJerarquicaParams {
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

export const generarExcelRedJerarquica = ({
  datos,
  columnas,
  configuracion,
}: GenerarExcelRedJerarquicaParams) => {
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
  ): unknown => {
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
          : "";
      case "total_subordinados":
        return contarSubordinadosRecursivo(usuario);
      case "total_simpatizantes":
        return usuario.total_simpatizantes ?? 0;
      case "estado":
        return usuario.estado ? "Activo" : "Inactivo";
      default:
        return "";
    }
  };

  const aplanarArbol = (
    nodos: UsuarioJerarquico[],
    nivel: number = 0,
    parentPath: string = "",
  ): Array<{ usuario: UsuarioJerarquico; nivel: number; path: string }> => {
    const resultado: Array<{
      usuario: UsuarioJerarquico;
      nivel: number;
      path: string;
    }> = [];

    nodos.forEach((usuario, index) => {
      const currentPath = parentPath
        ? `${parentPath}.${index + 1}`
        : `${index + 1}`;
      resultado.push({ usuario, nivel, path: currentPath });

      if (
        usuario.subordinados_directos &&
        usuario.subordinados_directos.length > 0
      ) {
        const subordinados = aplanarArbol(
          usuario.subordinados_directos,
          nivel + 1,
          currentPath,
        );
        resultado.push(...subordinados);
      }
    });

    return resultado;
  };

  const workbook = XLSX.utils.book_new();

  const wsData: unknown[][] = [];

  wsData.push(["POLADMIN - Sistema de Gestión Política"]);
  wsData.push(["Reporte de Red Jerárquica"]);
  wsData.push([]);
  wsData.push(["Campaña:", configuracion.campana]);
  wsData.push(["Generado por:", configuracion.generadoPor]);
  wsData.push(["Fecha:", new Date().toLocaleDateString("es-PY")]);
  wsData.push([
    "Visualización:",
    configuracion.tipoVisualizacion === "arbol"
      ? "Árbol jerárquico"
      : configuracion.tipoVisualizacion === "tabla"
        ? "Tabla por niveles"
        : "Solo estadísticas",
  ]);
  wsData.push([]);

  if (configuracion.incluirEstadisticas) {
    wsData.push(["=== ESTADÍSTICAS POR NIVEL ==="]);
    wsData.push([]);
    wsData.push(["Nivel", "Total", "Activos", "Inactivos"]);

    datos.estadisticas_por_nivel.forEach((stat) => {
      wsData.push([stat.nivel, stat.total, stat.activos, stat.inactivos]);
    });

    wsData.push([]);
    wsData.push(["Total general:", datos.total_usuarios]);
    wsData.push(["Niveles jerárquicos:", datos.total_niveles]);
    wsData.push([]);
    wsData.push([]);
  }

  if (configuracion.tipoVisualizacion === "arbol") {
    wsData.push(["=== ESTRUCTURA JERÁRQUICA ==="]);
    wsData.push([]);

    const usuariosAplanados = aplanarArbol(datos.arbol_jerarquico);

    wsData.push([
      "Nivel",
      "Posición",
      "Nombre Completo",
      "Username",
      "Perfil",
      "Superior",
      "Subordinados",
      "Estado",
    ]);

    usuariosAplanados.forEach(({ usuario, nivel, path }) => {
      const indentacion = "  ".repeat(nivel);
      const nombreCompleto = `${indentacion}${usuario.nombre} ${usuario.apellido}`;
      const superior = usuario.candidato_superior
        ? `${usuario.candidato_superior.nombre} ${usuario.candidato_superior.apellido}`
        : "-";
      const totalSub = contarSubordinadosRecursivo(usuario);

      wsData.push([
        usuario.nivel?.nombre || "Sin nivel",
        path,
        nombreCompleto,
        usuario.username,
        usuario.perfil.nombre,
        superior,
        totalSub,
        usuario.estado ? "Activo" : "Inactivo",
      ]);
    });
  } else if (configuracion.tipoVisualizacion === "tabla") {
    wsData.push(["=== LISTADO DE USUARIOS ==="]);
    wsData.push([]);

    const headers = columnasVisibles.map((col) => col.label);
    wsData.push(headers);

    const usuariosAplanados = aplanarArbol(datos.arbol_jerarquico);

    usuariosAplanados.forEach(({ usuario }) => {
      const fila = columnasVisibles.map((col) =>
        getCellValue(usuario, col.key),
      );
      wsData.push(fila);
    });
  }

  wsData.push([]);
  wsData.push([
    `Total: ${datos.total_usuarios} usuarios en ${datos.total_niveles} niveles`,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  const maxCol = Math.max(columnasVisibles.length, 8, 4);

  const colWidths = Array(maxCol)
    .fill(null)
    .map((_, i) => {
      if (i === 0) return { width: 20 };
      if (i === 1) return { width: 12 };
      if (i === 2) return { width: 25 };
      return { width: 15 };
    });

  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Red Jerárquica");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fechaArchivo = new Date().toISOString().split("T")[0];
  const nombreArchivo =
    configuracion.tipoVisualizacion === "arbol"
      ? `red-jerarquica-arbol-${fechaArchivo}.xlsx`
      : configuracion.tipoVisualizacion === "tabla"
        ? `red-jerarquica-tabla-${fechaArchivo}.xlsx`
        : `red-jerarquica-stats-${fechaArchivo}.xlsx`;

  saveAs(blob, nombreArchivo);
};
