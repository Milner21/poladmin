import type { ColumnaReporte } from '@dto/reportes.types';

export const columnasUsuarios: ColumnaReporte[] = [
  { key: 'nro', label: 'Nro', enabled: true },
  { key: 'nombre', label: 'Nombre', enabled: true },
  { key: 'apellido', label: 'Apellido', enabled: true },
  { key: 'username', label: 'Username', enabled: true },
  { key: 'documento', label: 'Documento', enabled: true },
  { key: 'telefono', label: 'Teléfono', enabled: false },
  { key: 'perfil', label: 'Perfil', enabled: true },
  { key: 'nivel', label: 'Nivel', enabled: true },
  { key: 'candidato_superior', label: 'Candidato Superior', enabled: false },
  { key: 'estado', label: 'Estado', enabled: true },
  { key: 'fecha_registro', label: 'Fecha Registro', enabled: false },
  { key: 'total_simpatizantes', label: 'Simpatizantes Propios', enabled: true },
  { key: 'total_simpatizantes_red', label: 'Simpatizantes Red', enabled: false },
];

export const filtrosDisponibles = [
  { key: 'todos', label: 'Todos los perfiles' },
  { key: 'politicos', label: 'Solo políticos' },
  { key: 'operativos', label: 'Solo operativos' },
];

export const estadosDisponibles = [
  { key: 'todos', label: 'Todos' },
  { key: 'activos', label: 'Solo activos' },
  { key: 'inactivos', label: 'Solo inactivos' },
];