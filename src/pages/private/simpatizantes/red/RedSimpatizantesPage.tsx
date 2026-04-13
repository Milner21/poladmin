import { PageHeader } from "@components";
import { CTable } from "@components/CTable/CTable";
import type { ColumnDef } from "@components/CTable/CTable.types";
import { usePermisos } from "@hooks/usePermisos";
import { Users, User } from "lucide-react";
import { useState, useMemo, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useRedConSimpatizantes } from "../hooks/useRedConSimpatizantes";
import RoutesConfig from "@routes/RoutesConfig";

interface UsuarioRed {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  telefono: string | null;
  nivel: { id: string; nombre: string; orden: number } | null;
  perfil: {
    id: string;
    nombre: string;
    es_operativo: boolean;
    nivel: { id: string; nombre: string; orden: number } | null;
  };
  estado: boolean;
  total_simpatizantes: number;
  [key: string]: unknown;
}

const RedSimpatizantesPage: FC = () => {
  const navigate = useNavigate();
  const { tienePermiso } = usePermisos();
  const { data: usuarios, isLoading } = useRedConSimpatizantes();
  const [searchTerm, setSearchTerm] = useState("");

  const puedeGestionarRed = tienePermiso("gestionar_red_simpatizantes");

  const columns: ColumnDef<UsuarioRed>[] = useMemo(
    () => [
      {
        key: "nro",
        title: "#",
        render: (_record: UsuarioRed, index?: number) => (
          <span className="text-text-tertiary text-xs">{(index ?? 0) + 1}</span>
        ),
        width: "40px",
      },
      {
        key: "nombre_completo",
        title: "Nombre",
        sortable: true,
        render: (record: UsuarioRed) => (
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {record.nombre} {record.apellido}
            </p>
            <p className="text-xs text-text-tertiary">@{record.username}</p>
          </div>
        ),
      },
      {
        key: "nivel",
        title: "Nivel",
        render: (record: UsuarioRed) => (
          <span className="text-sm text-text-primary">
            {record.perfil.es_operativo
              ? "Operativo"
              : (record.nivel?.nombre ?? "-")}
          </span>
        ),
      },
      {
        key: "perfil",
        title: "Perfil",
        render: (record: UsuarioRed) => (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-bg-base text-text-secondary border border-border">
            {record.perfil.nombre}
          </span>
        ),
      },
      {
        key: "estado",
        title: "Estado",
        render: (record: UsuarioRed) => (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              record.estado
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            }`}
          >
            {record.estado ? "Activo" : "Inactivo"}
          </span>
        ),
      },
      {
        key: "total_simpatizantes",
        title: "Simpatizantes",
        render: (record: UsuarioRed) => (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              <Users size={10} />
              {record.total_simpatizantes}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  const totalSimpatizantes =
    usuarios?.reduce((acc, u) => acc + u.total_simpatizantes, 0) ?? 0;

  if (!puedeGestionarRed) {
    return (
      <div className="py-4 px-6">
        <PageHeader
          title="Red de Simpatizantes"
          subtitle="Usuarios de tu red jerarquica"
          showDivider
        />
        <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
          <User size={48} className="mb-4 opacity-30" />
          <p className="text-sm">No tenes permiso para ver esta seccion</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Red de Simpatizantes"
        subtitle="Doble click sobre un usuario para ver sus simpatizantes"
        showDivider
      />

      <div className="grid grid-cols-2 gap-3 mb-6 max-w-sm">
        <div className="bg-bg-content border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-primary" />
            <p className="text-xs text-text-tertiary">Usuarios en red</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {usuarios?.length ?? 0}
          </p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-success" />
            <p className="text-xs text-text-tertiary">Total simpatizantes</p>
          </div>
          <p className="text-2xl font-bold text-success">
            {totalSimpatizantes}
          </p>
        </div>
      </div>

      <CTable<UsuarioRed>
        data={usuarios ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        pagination={true}
        defaultPageSize={25}
        onRowDoubleClick={(record) => {
          navigate(RoutesConfig.simpatizantesRedUsuario(record.id));
        }}
      />
    </div>
  );
};

export default RedSimpatizantesPage;