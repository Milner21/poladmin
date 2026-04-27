import type { ColumnaReporte } from '@dto/reportes.types';

export const columnasSimpatizantes: ColumnaReporte[] = [
  { key: 'nro', label: 'Nro', enabled: true },
  { key: 'nombre', label: 'Nombre', enabled: true },
  { key: 'apellido', label: 'Apellido', enabled: true },
  { key: 'documento', label: 'Documento', enabled: true },
  { key: 'telefono', label: 'Teléfono', enabled: true },
  { key: 'departamento', label: 'Departamento', enabled: false },
  { key: 'distrito', label: 'Distrito', enabled: false },
  { key: 'barrio', label: 'Barrio', enabled: true },
  { key: 'intencion_voto', label: 'Intención de Voto', enabled: true },
  { key: 'es_afiliado', label: 'Afiliado', enabled: false },
  { key: 'necesita_transporte', label: 'Necesita Transporte', enabled: false },
  { key: 'origen_registro', label: 'Origen', enabled: false },
  { key: 'candidato', label: 'Candidato Asignado', enabled: true },
  { key: 'registrado_por', label: 'Registrado Por', enabled: false },
  { key: 'fecha_registro', label: 'Fecha Registro', enabled: true },
  { key: 'tiene_gps', label: 'Tiene GPS', enabled: false },
];

export const intencionesVoto = [
  { key: 'todos', label: 'Todas las intenciones' },
  { key: 'SEGURO', label: 'Voto seguro' },
  { key: 'PROBABLE', label: 'Voto probable' },
  { key: 'INDECISO', label: 'Indeciso' },
  { key: 'OPOSITOR', label: 'Opositor' },
];

export const origenes = [
  { key: 'todos', label: 'Todos los orígenes' },
  { key: 'PADRON_INTERNO', label: 'Padrón interno' },
  { key: 'PADRON_GENERAL', label: 'Padrón general' },
  { key: 'MANUAL', label: 'Registro manual' },
];

export const opcionesAfiliacion = [
  { key: 'todos', label: 'Todos' },
  { key: 'afiliados', label: 'Solo afiliados' },
  { key: 'no_afiliados', label: 'Solo no afiliados' },
];

export const opcionesTransporte = [
  { key: 'todos', label: 'Todos' },
  { key: 'necesita', label: 'Necesita transporte' },
  { key: 'no_necesita', label: 'No necesita transporte' },
];