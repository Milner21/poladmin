// src/pages/private/reportes-imprimir/utils/filtrosReporte.ts

const ETIQUETAS_FILTROS: Record<string, string> = {
  candidato: "Candidato",
  candidato_id: "Candidato",
  registrado_por: "Registrado por",
  registrado_por_id: "Registrado por",
  departamento: "Departamento",
  distrito: "Distrito",
  barrio: "Barrio",
  intencion_voto: "Intención",
  es_afiliado: "Afiliado",
  necesita_transporte: "Transporte",
  origen_registro: "Origen",
  fecha_desde: "Desde",
  fecha_hasta: "Hasta",
  fecha_registro_desde: "Registrado desde",
  fecha_registro_hasta: "Registrado hasta",
  perfil: "Perfil",
  perfil_id: "Perfil",
  nivel: "Nivel",
  nivel_id: "Nivel",
  estado: "Estado",
  candidato_superior: "Candidato Superior",
  candidato_superior_id: "Candidato Superior",
  tiene_telefono: "Con Teléfono",
  tiene_nivel: "Con Nivel",
};

const VALORES_BOOLEANOS: Record<string, string> = {
  true: "Sí",
  false: "No",
};

const VALORES_INTENCION: Record<string, string> = {
  SEGURO: "Seguro",
  PROBABLE: "Probable",
  INDECISO: "Indeciso",
  OPOSITOR: "Opositor",
};

const VALORES_ORIGEN: Record<string, string> = {
  PADRON_INTERNO: "Padrón Interno",
  PADRON_GENERAL: "Padrón General",
  MANUAL: "Manual",
};

const REGEX_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function formatearFiltrosAplicados(
  filtrosAplicados?: Record<string, unknown>,
): string {
  if (!filtrosAplicados) return "Sin filtros aplicados";

  const filtrosLegibles: string[] = [];

  for (const [clave, valor] of Object.entries(filtrosAplicados)) {
    if (valor === undefined || valor === null || valor === "") continue;

    const stringValor = String(valor);

    // Omitir IDs tecnicos (UUIDs de base de datos)
    if (REGEX_UUID.test(stringValor)) {
      continue;
    }

    const etiqueta = ETIQUETAS_FILTROS[clave] || clave;
    let valorFormateado = stringValor;

    if (stringValor in VALORES_BOOLEANOS) {
      valorFormateado = VALORES_BOOLEANOS[stringValor];
    } else if (stringValor in VALORES_INTENCION) {
      valorFormateado = VALORES_INTENCION[stringValor];
    } else if (stringValor in VALORES_ORIGEN) {
      valorFormateado = VALORES_ORIGEN[stringValor];
    }

    filtrosLegibles.push(`${etiqueta}: ${valorFormateado}`);
  }

  if (filtrosLegibles.length === 0) {
    return "Sin filtros aplicados";
  }

  return filtrosLegibles.join(", ");
}
