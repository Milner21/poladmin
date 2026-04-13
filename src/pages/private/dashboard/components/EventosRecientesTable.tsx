import { CTable } from '@components';
import type { ColumnDef } from '@components/CTable';
import type { FC } from 'react';
import type { EventoReciente } from '@dto/dashboard.types';

interface Props {
  data: EventoReciente[];
  loading?: boolean;
}

const columns: ColumnDef<EventoReciente>[] = [
  {
    key: 'nombre',
    title: 'Nombre',
    dataIndex: 'nombre',
  },
  {
    key: 'fecha',
    title: 'Fecha',
    dataIndex: 'fecha',
    render: (record) => (
      <span>{new Date(record.fecha).toLocaleDateString()}</span>
    ),
  },
  {
    key: 'lugar',
    title: 'Lugar',
    dataIndex: 'lugar',
  },
  {
    key: 'total_asistencias',
    title: 'Asistencias',
    dataIndex: 'total_asistencias',
    align: 'center',
  },
  {
    key: 'creado_por',
    title: 'Creado por',
    render: (record) => (
      <span>
        {record.creado_por.nombre} {record.creado_por.apellido} ({record.creado_por.rol})
      </span>
    ),
  },
];

export const EventosRecientesTable: FC<Props> = ({ data, loading = false }) => {
  return (
    <CTable<EventoReciente>
      data={data}
      columns={columns}
      rowKey="id"
      loading={loading}
      pagination={false}
      defaultPageSize={10}
    />
  );
};