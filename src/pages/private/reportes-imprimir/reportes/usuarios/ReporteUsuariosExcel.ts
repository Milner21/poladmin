import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { UsuarioReporte, ColumnaReporte } from "@dto/reportes.types";

interface GenerarExcelUsuariosParams {
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

export const generarExcelUsuarios = ({
  datos,
  columnas,
  configuracion,
}: GenerarExcelUsuariosParams) => {
  const columnasVisibles = columnas.filter((col) => col.enabled);

  const getCellValue = (
    usuario: UsuarioReporte,
    columnaKey: string,
    index: number,
  ): unknown => {
    switch (columnaKey) {
      case "nro":
        return index + 1;
      case "nombre":
        return usuario.nombre;
      case "apellido":
        return usuario.apellido;
      case "username":
        return usuario.username;
      case "documento":
        return usuario.documento;
      case "telefono":
        return usuario.telefono || "";
      case "perfil":
        return usuario.perfil;
      case "nivel":
        return usuario.nivel || "Sin nivel";
      case "candidato_superior":
        return usuario.candidato_superior || "";
      case "estado":
        return usuario.estado ? "Activo" : "Inactivo";
      case "fecha_registro":
        return new Date(usuario.fecha_registro).toLocaleDateString("es-PY");
      case "total_simpatizantes":
        return usuario.total_simpatizantes ?? 0;
      case "total_simpatizantes_red":
        return usuario.total_simpatizantes_red ?? 0;
      default:
        return "";
    }
  };

  const workbook = XLSX.utils.book_new();

  // Crear hoja principal
  const wsData: unknown[][] = [];

  // Header info
  wsData.push(["POLADMIN - Sistema de Gestión Política"]);
  wsData.push(["Reporte de Usuarios"]);
  wsData.push([]);
  wsData.push(["Campaña:", configuracion.campana]);
  wsData.push(["Generado por:", configuracion.generadoPor]);
  wsData.push(["Fecha:", new Date().toLocaleDateString("es-PY")]);

  const filtrosTexto =
    Object.entries(datos.filtros_aplicados)
      .filter(([, valor]) => valor)
      .map(([clave, valor]) => `${clave}: ${valor}`)
      .join(", ") || "Sin filtros aplicados";
  wsData.push(["Filtros aplicados:", filtrosTexto]);
  wsData.push([]);

  if (configuracion.agruparPorNivel) {
    // Agrupar por nivel
    const usuariosPorNivel = datos.usuarios.reduce(
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
    );

    // Ordenar grupos
    const gruposOrdenados = Object.entries(usuariosPorNivel).sort(
      ([, a], [, b]) => a.orden - b.orden,
    );

    gruposOrdenados.forEach(([, grupo]) => {
      // Header del grupo
      wsData.push([
        `=== ${grupo.nivel} (${grupo.usuarios.length} usuarios) ===`,
      ]);
      wsData.push([]);

      // Headers de tabla
      const headers = columnasVisibles.map((col) => col.label);
      wsData.push(headers);

      // Datos del grupo
      grupo.usuarios.forEach((usuario, index) => {
        const fila = columnasVisibles.map((col) =>
          getCellValue(usuario, col.key, index),
        );
        wsData.push(fila);
      });

      wsData.push([]);
    });
  } else {
    // Sin agrupación
    const headers = columnasVisibles.map((col) => col.label);
    wsData.push(headers);

    datos.usuarios.forEach((usuario, index) => {
      const fila = columnasVisibles.map((col) =>
        getCellValue(usuario, col.key, index),
      );
      wsData.push(fila);
    });
  }

  wsData.push([]);
  wsData.push([`Total: ${datos.total} usuarios`]);

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Configurar anchos
  const colWidths = Array(Math.max(columnasVisibles.length, 2))
    .fill(null)
    .map((_, i) => {
      if (i === 0) return { width: 20 };
      return { width: 15 };
    });
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");

  // Generar archivo
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fechaArchivo = new Date().toISOString().split("T")[0];
  const nombreArchivo = configuracion.agruparPorNivel
    ? `usuarios-por-nivel-${fechaArchivo}.xlsx`
    : `usuarios-${fechaArchivo}.xlsx`;

  saveAs(blob, nombreArchivo);
};
