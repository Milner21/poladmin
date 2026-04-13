import type { ColumnDef } from '@components/CTable/CTable.types';
import type { Usuario } from '@dto/usuario.types';

export const getUsuariosColumns = (): ColumnDef<Usuario>[] => [
  {
    key: 'nro',
    title: 'Nro',
    render: (_record: Usuario, index?: number) => (index ?? 0) + 1,
    width: '60px',
  },
  {
    key: 'username',
    title: 'Usuario',
    dataIndex: 'username',
    sortable: true,
  },
  {
    key: 'nombre',
    title: 'Nombre',
    dataIndex: 'nombre',
    sortable: true,
  },
  {
    key: 'apellido',
    title: 'Apellido',
    dataIndex: 'apellido',
    sortable: true,
  },
  {
    key: 'documento',
    title: 'Documento',
    dataIndex: 'documento',
  },
  {
    key: 'perfil',
    title: 'Perfil',
    filterable: true,
    filters: [
      { text: 'ROOT', value: 'ROOT' },
      { text: 'INTENDENTE', value: 'INTENDENTE' },
      { text: 'CONCEJAL', value: 'CONCEJAL' },
      { text: 'GESTOR', value: 'GESTOR' },
      { text: 'LIDER', value: 'LIDER' },
    ],
    onFilter: (value: string, record: Usuario) => record.perfil.nombre === value,
    render: (record: Usuario) => (
      <span className="inline-block px-2 py-0.5 rounded text-white text-xs bg-info">
        {record.perfil.nombre}
      </span>
    ),
  },
  {
    key: 'estado',
    title: 'Estado',
    filterable: true,
    filters: [
      { text: 'Activo', value: 'true' },
      { text: 'Inactivo', value: 'false' },
    ],
    onFilter: (value: string, record: Usuario) =>
      String(record.estado) === value,
    render: (record: Usuario) => (
      <span
        className={`
          inline-block px-2 py-0.5 rounded text-white text-xs
          ${record.estado ? 'bg-success' : 'bg-danger'}
        `}
      >
        {record.estado ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
  {
    key: 'candidato_superior',
    title: 'Candidato Superior',
    render: (record: Usuario) => {
      if (!record.candidato_superior) return '-';
      return (
        <span className="text-sm text-text-primary">
          {record.candidato_superior.nombre} {record.candidato_superior.apellido}
        </span>
      );
    },
  },
];