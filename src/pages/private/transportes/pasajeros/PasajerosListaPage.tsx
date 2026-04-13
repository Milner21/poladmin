import { CTable, PageHeader } from "@components";
import type { ColumnDef } from "@components/CTable/CTable.types";
import type { PasajeroTransporte } from "@dto/transporte.types";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { usePermisos } from "@hooks/usePermisos";
import RoutesConfig from "@routes/RoutesConfig";
import { AlertTriangle, CheckCircle, Clock, Plus, Users } from "lucide-react";
import { useMemo, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { usePasajeros } from "../hooks/usePasajeros";

const PasajerosListaPage: FC = () => {
  const navigate = useNavigate();
  const { campanaActual } = useCampanaSeleccionada();
  const { tienePermiso } = usePermisos();

  const { data: pasajeros, isLoading } = usePasajeros();

  const puedeCargar = tienePermiso("cargar_pasajero");

  const columns: ColumnDef<PasajeroTransporte & Record<string, unknown>>[] = useMemo(() => {
    return [
      {
        key: "nro",
        title: "#",
        render: (_: PasajeroTransporte & Record<string, unknown>, index?: number) => (
          <span className="text-text-tertiary text-xs">{(index ?? 0) + 1}</span>
        ),
        width: "40px",
      },
      {
        key: "simpatizante",
        title: "Pasajero",
        sortable: true,
        render: (record: PasajeroTransporte & Record<string, unknown>) => (
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {record.simpatizante?.nombre} {record.simpatizante?.apellido}
            </p>
            <div className="md:hidden mt-1">
              <p className="text-xs text-text-tertiary">CI: {record.simpatizante?.documento}</p>
              <p className="text-xs text-text-tertiary">{record.transportista?.chapa_vehiculo}</p>
            </div>
          </div>
        ),
      },
      {
        key: "documento",
        title: "CI",
        responsive: ["md"],
        render: (record: PasajeroTransporte & Record<string, unknown>) => (
          <span className="text-sm text-text-primary">{record.simpatizante?.documento}</span>
        ),
      },
      {
        key: "transportista",
        title: "Transportista",
        responsive: ["lg"],
        render: (record: PasajeroTransporte & Record<string, unknown>) => (
          <div className="text-sm">
            <p className="font-medium text-text-primary">
              {record.transportista?.nombre} {record.transportista?.apellido}
            </p>
            <p className="text-xs text-text-tertiary">{record.transportista?.chapa_vehiculo}</p>
          </div>
        ),
      },
            {
        key: "votacion",
        title: "Local / Mesa",
        responsive: ["lg"],
        render: (record: PasajeroTransporte & Record<string, unknown>) => {
          const local =
            record.simpatizante?.local_votacion_interna ||
            record.simpatizante?.local_votacion_general ||
            '-';
          const mesa =
            record.simpatizante?.mesa_votacion_interna ||
            record.simpatizante?.mesa_votacion_general ||
            '-';
          return (
            <div className="text-xs">
              <p className="text-text-primary">{local}</p>
              <p className="text-text-tertiary">Mesa: {mesa}</p>
            </div>
          );
        },
      },
      {
        key: "hora_recogida",
        title: "Hora Recogida",
        responsive: ["md"],
        render: (record: PasajeroTransporte & Record<string, unknown>) =>
          record.hora_recogida ? (
            <span className="text-xs text-text-primary">
              {new Date(record.hora_recogida).toLocaleTimeString("es-PY", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : (
            <span className="text-xs text-text-tertiary">-</span>
          ),
      },
      {
        key: "estado",
        title: "Estado",
        render: (record: PasajeroTransporte & Record<string, unknown>) => {
          if (record.fue_por_cuenta) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-text-tertiary/10 text-text-tertiary">
                Fue solo
              </span>
            );
          }
          if (record.confirmado) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                <CheckCircle size={12} />
                Confirmado
              </span>
            );
          }
          if (record.es_duplicado) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">
                <AlertTriangle size={12} />
                Duplicado
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-info/10 text-info">
              <Clock size={12} />
              Pendiente
            </span>
          );
        },
      },
      {
        key: "fecha_registro",
        title: "Fecha Registro",
        responsive: ["lg"],
        render: (record: PasajeroTransporte & Record<string, unknown>) => (
          <span className="text-xs text-text-tertiary">
            {new Date(record.fecha_registro).toLocaleDateString("es-PY")}
          </span>
        ),
      },
    ];
  }, []);

  const stats = useMemo(() => {
    if (!pasajeros) return { total: 0, confirmados: 0, pendientes: 0, duplicados: 0 };

    return {
      total: pasajeros.length,
      confirmados: pasajeros.filter((p) => p.confirmado).length,
      pendientes: pasajeros.filter((p) => !p.confirmado && !p.fue_por_cuenta).length,
      duplicados: pasajeros.filter((p) => p.es_duplicado).length,
    };
  }, [pasajeros]);

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={campanaActual ? `Pasajeros — ${campanaActual.nombre}` : "Pasajeros"}
        subtitle="Listado de pasajeros registrados en transportes"
        showDivider
      />

      {puedeCargar && (
        <div className="mb-4">
          <button
            onClick={() => navigate(RoutesConfig.transportesPasajerosRegistrar)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Registrar Pasajero</span>
            <span className="md:hidden">Nuevo</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-primary" />
            <p className="text-xs text-text-tertiary">Total</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-success" />
            <p className="text-xs text-text-tertiary">Confirmados</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-success">{stats.confirmados}</p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-info" />
            <p className="text-xs text-text-tertiary">Pendientes</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-info">{stats.pendientes}</p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-warning" />
            <p className="text-xs text-text-tertiary">Duplicados</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-warning">{stats.duplicados}</p>
        </div>
      </div>

      <CTable<PasajeroTransporte & Record<string, unknown>>
        data={(pasajeros || []) as (PasajeroTransporte & Record<string, unknown>)[]}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        searchable={true}
        pagination={true}
        defaultPageSize={25}
      />
    </div>
  );
};

export default PasajerosListaPage;