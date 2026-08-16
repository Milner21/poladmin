//src/pages/private/usuarios/components/usuariosColumns.tsx

import type { ColumnDef } from "@components/CTable/CTable.types";
import type { Usuario } from "@dto/usuario.types";

export const getUsuariosColumns = (
  perfilesUnicos: string[],
): ColumnDef<Usuario>[] => [
  {
    key: "nro",
    title: "Nro",
    render: (_record: Usuario, index?: number) => (index ?? 0) + 1,
    width: "60px",
  },
  {
    key: "username",
    title: "Usuario",
    dataIndex: "username",
    sortable: true,
  },
  {
    key: "nombre",
    title: "Nombre",
    dataIndex: "nombre",
    sortable: true,
  },
  {
    key: "apellido",
    title: "Apellido",
    dataIndex: "apellido",
    sortable: true,
  },
  {
    key: "documento",
    title: "Documento",
    dataIndex: "documento",
  },
  {
    key: "perfil",
    title: "Perfil",
    filterable: true,
    filters: perfilesUnicos.map((perfil) => ({ text: perfil, value: perfil })),
    onFilter: (value: string, record: Usuario) =>
      record.perfil.nombre === value,
    render: (record: Usuario) => (
      <span className="inline-block px-2 py-0.5 rounded text-white text-xs bg-info">
        {record.perfil.nombre}
      </span>
    ),
  },
  {
    key: "estado",
    title: "Estado",
    filterable: true,
    filters: [
      { text: "Activo", value: "true" },
      { text: "Inactivo", value: "false" },
    ],
    onFilter: (value: string, record: Usuario) =>
      String(record.estado) === value,
    render: (record: Usuario) => (
      <span
        className={`
          inline-block px-2 py-0.5 rounded text-white text-xs
          ${record.estado ? "bg-success" : "bg-danger"}
        `}
      >
        {record.estado ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    key: "modo_electoral",
    title: "Modo",
    render: (record: Usuario) => {
      const etiquetas: string[] = [];
      if (record.activo_internas === true) etiquetas.push("INT");
      if (record.activo_generales === true) etiquetas.push("GEN");
      if (record.activo_internas === null && record.activo_generales === null) {
        return <span className="text-text-tertiary text-xs">-</span>;
      }
      if (etiquetas.length === 0) {
        return (
          <span className="inline-block px-2 py-0.5 rounded text-xs bg-danger/10 text-danger border border-danger/20">
            Sin modo
          </span>
        );
      }
      return (
        <div className="flex gap-1">
          {etiquetas.map((e) => (
            <span
              key={e}
              className="inline-block px-2 py-0.5 rounded text-xs bg-primary/10 text-primary border border-primary/20 font-medium"
            >
              {e}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    key: "candidato_superior",
    title: "Candidato Superior",
    render: (record: Usuario) => {
      if (!record.candidato_superior) return "-";
      return (
        <span className="text-sm text-text-primary">
          {record.candidato_superior.nombre}{" "}
          {record.candidato_superior.apellido}
        </span>
      );
    },
  },
];
