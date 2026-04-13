import { CTable } from "@components/CTable/CTable";
import type { ColumnDef } from "@components/CTable/CTable.types";
import type { FC } from "react";

interface TopUsuario {
  id: string;
  nombre: string;
  apellido: string;
  perfil: string;
  total_simpatizantes_registrados: number;
  [key: string]: unknown;
}

interface TopSimpatizantesTableProps {
  data: TopUsuario[];
  loading?: boolean;
  title: string;
  subTitle?: string;
  containerHeight: number;
}

const TopSimpatizantesTable: FC<TopSimpatizantesTableProps> = ({
  data,
  loading = false,
  title,
  subTitle,
  containerHeight,
}) => {
  const columns: ColumnDef<TopUsuario>[] = [
    {
      key: "index",
      title: "#",
      width: 40,
      align: "center",
      render: (_record, index) => index + 1,
    },
    {
      key: "usuario",
      title: "Usuario",
      render: (record) => `${record.nombre} ${record.apellido}`,
      sortable: true,
      sorter: (a, b) => {
        const fullNameA = `${a.nombre} ${a.apellido}`;
        const fullNameB = `${b.nombre} ${b.apellido}`;
        return fullNameA.localeCompare(fullNameB);
      },
      ellipsis: true,
    },
    {
      key: "perfil",
      title: "Perfil",
      dataIndex: "perfil",
      width: 100,
      sortable: true,
      sorter: (a, b) => a.perfil.localeCompare(b.perfil),
      filterable: true,
      filters: [
        { text: "LIDER", value: "LIDER" },
        { text: "GESTOR", value: "GESTOR" },
        { text: "CONSEJAL", value: "CONSEJAL" },
        { text: "INTENDENTE", value: "INTENDENTE" },
      ],
      onFilter: (value, record) => record.perfil === value,
    },
    {
      key: "registros",
      title: "Registros",
      dataIndex: "total_simpatizantes_registrados",
      width: 80,
      align: "right",
      sortable: true,
      sorter: (a, b) =>
        a.total_simpatizantes_registrados - b.total_simpatizantes_registrados,
    },
  ];

  return (
    <CTable<TopUsuario>
      data={data}
      columns={columns}
      loading={loading}
      title={title}
      subTitle={subTitle}
      rowKey="id"
      containerHeight={containerHeight}
      defaultSortColumn="registros"
      defaultSortDirection="desc"
      pagination={false}
      defaultPageSize={0}
    />
  );
};

export default TopSimpatizantesTable;