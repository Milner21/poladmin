import { CTable, PageHeader } from "@components";
import type { ColumnDef } from "@components/CTable/CTable.types";
import type { Solicitud } from "@dto/solicitud.types";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { usePermisos } from "@hooks/usePermisos";
import RoutesConfig from "@routes/RoutesConfig";
import { AlertCircle, CheckCircle, Clock, Eye, Plus, XCircle } from "lucide-react";
import { useMemo, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useSolicitudes } from "../hooks/useSolicitudes";

const SolicitudesListaPage: FC = () => {
  const navigate = useNavigate();
  const { campanaActual } = useCampanaSeleccionada();
  const { tienePermiso } = usePermisos();

  const { data: solicitudes, isLoading } = useSolicitudes();
  
  const puedeCrear = tienePermiso("crear_solicitud");

  const columns: ColumnDef<Solicitud & Record<string, unknown>>[] = useMemo(() => {
    const getColorEstado = (estado: string): string => {
      switch (estado) {
        case "PENDIENTE": return "bg-warning/10 text-warning border-warning/20";
        case "EN_PROCESO": return "bg-info/10 text-info border-info/20";
        case "AGENDADA": return "bg-primary/10 text-primary border-primary/20";
        case "CUMPLIDA": return "bg-success/10 text-success border-success/20";
        case "RECHAZADA": return "bg-danger/10 text-danger border-danger/20";
        default: return "bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20";
      }
    };

    const getColorPrioridad = (prioridad: string): string => {
      switch (prioridad) {
        case "ALTA": return "bg-danger text-white";
        case "MEDIA": return "bg-warning text-white";
        case "BAJA": return "bg-info text-white";
        default: return "bg-text-tertiary text-white";
      }
    };

    const getIconoEstado = (estado: string) => {
      switch (estado) {
        case "PENDIENTE": return <Clock size={14} />;
        case "EN_PROCESO": return <AlertCircle size={14} />;
        case "CUMPLIDA": return <CheckCircle size={14} />;
        case "RECHAZADA": return <XCircle size={14} />;
        default: return <Clock size={14} />;
      }
    };

    return [
      {
        key: "nro",
        title: "#",
        render: (_: Solicitud & Record<string, unknown>, index?: number) => (
          <span className="text-text-tertiary text-xs">{(index ?? 0) + 1}</span>
        ),
        width: "40px",
      },
      {
        key: "titulo",
        title: "Solicitud",
        sortable: true,
        render: (record: Solicitud & Record<string, unknown>) => (
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{record.titulo}</p>
            <div className="md:hidden mt-1">
              <p className="text-xs text-text-tertiary truncate">
                {record.simpatizante?.nombre} {record.simpatizante?.apellido}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "simpatizante",
        title: "Simpatizante",
        responsive: ["md"],
        render: (record: Solicitud & Record<string, unknown>) => (
          <div className="text-sm">
            <p className="font-medium text-text-primary">
              {record.simpatizante?.nombre} {record.simpatizante?.apellido}
            </p>
            <p className="text-xs text-text-tertiary">CI: {record.simpatizante?.documento}</p>
          </div>
        ),
      },
      {
        key: "prioridad",
        title: "Prioridad",
        responsive: ["lg"],
        render: (record: Solicitud & Record<string, unknown>) => (
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getColorPrioridad(record.prioridad)}`}>
            {record.prioridad}
          </span>
        ),
      },
      {
        key: "estado",
        title: "Estado",
        render: (record: Solicitud & Record<string, unknown>) => (
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border ${getColorEstado(record.estado)}`}>
            {getIconoEstado(record.estado)}
            <span className="hidden md:inline">{record.estado.replace("_", " ")}</span>
          </span>
        ),
      },
      {
        key: "asignado_a",
        title: "Asignado a",
        responsive: ["lg"],
        render: (record: Solicitud & Record<string, unknown>) =>
          record.asignado_a ? (
            <span className="text-sm text-text-primary">
              {record.asignado_a.nombre} {record.asignado_a.apellido}
            </span>
          ) : (
            <span className="text-xs text-text-tertiary italic">Sin asignar</span>
          ),
      },
      {
        key: "fecha_registro",
        title: "Fecha",
        responsive: ["md"],
        render: (record: Solicitud & Record<string, unknown>) => (
          <span className="text-xs text-text-tertiary">
            {new Date(record.fecha_registro).toLocaleDateString("es-PY")}
          </span>
        ),
      },
      {
        key: "acciones",
        title: "Acciones",
        width: "80px",
        render: (record: Solicitud & Record<string, unknown>) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(RoutesConfig.solicitudesDetalle(record.id));
            }}
            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
            title="Ver detalle"
          >
            <Eye size={14} />
          </button>
        ),
      },
    ];
  }, [navigate]);

  const stats = useMemo(() => {
    if (!solicitudes) return { total: 0, pendientes: 0, enProceso: 0, agendadas: 0, cumplidas: 0 };
    return {
      total: solicitudes.length,
      pendientes: solicitudes.filter((s) => s.estado === "PENDIENTE").length,
      enProceso: solicitudes.filter((s) => s.estado === "EN_PROCESO").length,
      agendadas: solicitudes.filter((s) => s.estado === "AGENDADA").length,
      cumplidas: solicitudes.filter((s) => s.estado === "CUMPLIDA").length,
    };
  }, [solicitudes]);

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={campanaActual ? `Solicitudes — ${campanaActual.nombre}` : "Solicitudes de Simpatizantes"}
        subtitle="Gestiona las solicitudes y pedidos de los simpatizantes"
        showDivider
      />

      {puedeCrear && (
        <div className="mb-4">
          <button onClick={() => navigate(RoutesConfig.solicitudesCrear)} className="btn btn-primary flex items-center gap-2">
            <Plus size={16} />
            <span className="hidden md:inline">Nueva Solicitud</span>
            <span className="md:hidden">Nueva</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <p className="text-xs text-text-tertiary mb-1">Total</p>
          <p className="text-xl md:text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>
        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <p className="text-xs text-warning mb-1">Pendientes</p>
          <p className="text-xl md:text-2xl font-bold text-warning">{stats.pendientes}</p>
        </div>
        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <p className="text-xs text-info mb-1">En Proceso</p>
          <p className="text-xl md:text-2xl font-bold text-info">{stats.enProceso}</p>
        </div>
        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <p className="text-xs text-primary mb-1">Agendadas</p>
          <p className="text-xl md:text-2xl font-bold text-primary">{stats.agendadas}</p>
        </div>
        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-success mb-1">Cumplidas</p>
          <p className="text-xl md:text-2xl font-bold text-success">{stats.cumplidas}</p>
        </div>
      </div>

      <CTable<Solicitud & Record<string, unknown>>
        data={(solicitudes || []) as (Solicitud & Record<string, unknown>)[]}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        searchable={true}
        pagination={true}
        defaultPageSize={25}
        onRowDoubleClick={(record) => navigate(RoutesConfig.solicitudesDetalle(record.id))}
      />
    </div>
  );
};

export default SolicitudesListaPage;