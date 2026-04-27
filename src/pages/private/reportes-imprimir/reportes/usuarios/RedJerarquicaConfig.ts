import type { ColumnaReporte } from '@dto/reportes.types';

export const opcionesVisualizacion = [
  { key: 'arbol', label: 'Vista de árbol jerárquico' },
  { key: 'tabla', label: 'Vista de tabla por niveles' },
  { key: 'estadisticas', label: 'Solo estadísticas por nivel' },
];

export const opcionesDetalle = [
  { key: 'basico', label: 'Información básica' },
  { key: 'completo', label: 'Información detallada' },
  { key: 'contacto', label: 'Incluir información de contacto' },
];

export const columnasRedJerarquica: ColumnaReporte[] = [
  { key: 'nivel', label: 'Nivel', enabled: true },
  { key: 'nombre', label: 'Nombre', enabled: true },
  { key: 'apellido', label: 'Apellido', enabled: true },
  { key: 'username', label: 'Username', enabled: true },
  { key: 'perfil', label: 'Perfil', enabled: true },
  { key: 'candidato_superior', label: 'Candidato Superior', enabled: true },
  { key: 'total_subordinados', label: 'Total Subordinados', enabled: true },
  { key: 'total_simpatizantes', label: 'Simpatizantes Propios', enabled: true },
  { key: 'estado', label: 'Estado', enabled: false },
  { key: 'telefono', label: 'Teléfono', enabled: false },
];