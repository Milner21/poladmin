import { CTable, PageHeader } from "@components";
import type { ColumnDef } from "@components/CTable/CTable.types";
import type { VerificacionTransporte } from "@dto/transporte.types";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { AlertCircle, CheckCircle, Clock, Search, XCircle } from "lucide-react";
import { useMemo, useState, type FC } from "react";
import { useVerificaciones } from "../hooks/useVerificaciones";
import ModalResolverVerificacion from "./components/ModalResolverVerificacion";

const VerificacionesListaPage: FC = () => {
  const { campanaActual } = useCampanaSeleccionada();
  const { data: verificaciones, isLoading } = useVerificaciones();
  
  // Estado para el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [verificacionSeleccionada, setVerificacionSeleccionada] = useState<VerificacionTransporte | null>(null);

  const handleResolverClick = (verificacion: VerificacionTransporte) => {
    setVerificacionSeleccionada(verificacion);
    setModalAbierto(true);
  };

  const columns: ColumnDef<VerificacionTransporte & Record<string, unknown>>[] = useMemo(() => {
    const getColorEstado = (estado: string): string => {
      switch (estado) {
        case "PENDIENTE": return "bg-warning/10 text-warning border-warning/20";
        case "APROBADO": return "bg-success/10 text-success border-success/20";
        case "RECHAZADO": return "bg-danger/10 text-danger border-danger/20";
        default: return "bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20";
      }
    };

    const getIconoEstado = (estado: string) => {
      switch (estado) {
        case "PENDIENTE": return <Clock size={14} />;
        case "APROBADO": return <CheckCircle size={14} />;
        case "RECHAZADO": return <XCircle size={14} />;
        default: return <AlertCircle size={14} />;
      }
    };

    return [
      {
        key: "nro",
        title: "#",
        render: (_: VerificacionTransporte & Record<string, unknown>, index?: number) => (
          <span className="text-text-tertiary text-xs">{(index ?? 0) + 1}</span>
        ),
        width: "40px",
      },
      {
        key: "documento",
        title: "CI Buscado",
        sortable: true,
        render: (record: VerificacionTransporte & Record<string, unknown>) => (
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">{record.documento_buscado}</p>
            {(record.nombre_referencia || record.apellido_referencia) && (
              <p className="text-xs text-text-tertiary mt-1">
                {record.nombre_referencia} {record.apellido_referencia}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "transportista",
        title: "Solicitante",
        responsive: ["md"],
        render: (record: VerificacionTransporte & Record<string, unknown>) => (
          <div className="text-sm">
            <p className="font-medium text-text-primary">
              {record.transportista?.nombre} {record.transportista?.apellido}
            </p>
            {record.transportista?.telefono && (
              <p className="text-xs text-text-tertiary">{record.transportista.telefono}</p>
            )}
          </div>
        ),
      },
      {
        key: "estado",
        title: "Estado",
        render: (record: VerificacionTransporte & Record<string, unknown>) => (
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border ${getColorEstado(record.estado)}`}>
            {getIconoEstado(record.estado)}
            <span className="hidden md:inline">{record.estado}</span>
          </span>
        ),
      },
      {
        key: "operador",
        title: "Operador",
        responsive: ["lg"],
        render: (record: VerificacionTransporte & Record<string, unknown>) =>
          record.operador ? (
            <span className="text-sm text-text-primary">
              {record.operador.nombre} {record.operador.apellido}
            </span>
          ) : (
            <span className="text-xs text-text-tertiary italic">Sin asignar</span>
          ),
      },
      {
        key: "motivo_rechazo",
        title: "Observación",
        responsive: ["lg"],
        render: (record: VerificacionTransporte & Record<string, unknown>) =>
          record.motivo_rechazo ? (
            <span className="text-xs text-danger truncate max-w-xs block">
              {record.motivo_rechazo}
            </span>
          ) : (
            <span className="text-xs text-text-tertiary">-</span>
          ),
      },
      {
        key: "fecha_solicitud",
        title: "Fecha Solicitud",
        responsive: ["md"],
        render: (record: VerificacionTransporte & Record<string, unknown>) => (
          <span className="text-xs text-text-tertiary">
            {new Date(record.fecha_solicitud).toLocaleDateString("es-PY")}
          </span>
        ),
      },
      {
        key: "acciones",
        title: "Acciones",
        render: (record: VerificacionTransporte & Record<string, unknown>) => (
          record.estado === "PENDIENTE" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleResolverClick(record);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
            >
              <Search size={14} />
              Resolver
            </button>
          ) : null
        ),
      }
    ];
  }, []);

  const stats = useMemo(() => {
    if (!verificaciones) return { total: 0, pendientes: 0, aprobadas: 0, rechazadas: 0 };

    return {
      total: verificaciones.length,
      pendientes: verificaciones.filter((v) => v.estado === "PENDIENTE").length,
      aprobadas: verificaciones.filter((v) => v.estado === "APROBADO").length,
      rechazadas: verificaciones.filter((v) => v.estado === "RECHAZADO").length,
    };
  }, [verificaciones]);

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={campanaActual ? `Verificaciones — ${campanaActual.nombre}` : "Verificaciones de Transporte"}
        subtitle="Solicitudes de verificación de votantes no encontrados en padrón"
        showDivider
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} className="text-primary" />
            <p className="text-xs text-text-tertiary">Total</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-warning" />
            <p className="text-xs text-text-tertiary">Pendientes</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-warning">{stats.pendientes}</p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-success" />
            <p className="text-xs text-text-tertiary">Aprobadas</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-success">{stats.aprobadas}</p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={14} className="text-danger" />
            <p className="text-xs text-text-tertiary">Rechazadas</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-danger">{stats.rechazadas}</p>
        </div>
      </div>

      <CTable<VerificacionTransporte & Record<string, unknown>>
        data={(verificaciones || []) as (VerificacionTransporte & Record<string, unknown>)[]}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        searchable={true}
        pagination={true}
        defaultPageSize={25}
      />

      {/* Modal Integrado */}
      <ModalResolverVerificacion
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setVerificacionSeleccionada(null);
        }}
        verificacion={verificacionSeleccionada}
      />
    </div>
  );
};

export default VerificacionesListaPage;