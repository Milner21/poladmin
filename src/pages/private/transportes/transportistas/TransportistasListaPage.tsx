import { CTable, PageHeader } from "@components";
import type { ColumnDef } from "@components/CTable/CTable.types";
import type { Transportista } from "@dto/transporte.types";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { usePermisos } from "@hooks/usePermisos";
import RoutesConfig from "@routes/RoutesConfig";
import { Eye, Phone, Plus, Truck, Users } from "lucide-react";
import { useMemo, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useTransportistas } from "../hooks/useTransportistas";

const TransportistasListaPage: FC = () => {
  const navigate = useNavigate();
  const { campanaActual } = useCampanaSeleccionada();
  const { tienePermiso } = usePermisos();

  const { data: transportistas, isLoading } = useTransportistas();

  const puedeCrear = tienePermiso("registrar_transportista");

  const columns: ColumnDef<Transportista & Record<string, unknown>>[] = useMemo(() => {
    const getColorVehiculo = (tipo: string): string => {
      switch (tipo) {
        case "AUTO": return "bg-info/10 text-info border-info/20";
        case "SUV": return "bg-primary/10 text-primary border-primary/20";
        case "FURGON": return "bg-warning/10 text-warning border-warning/20";
        case "OMNIBUS": return "bg-success/10 text-success border-success/20";
        default: return "bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20";
      }
    };

    return [
      {
        key: "nro",
        title: "#",
        render: (_: Transportista & Record<string, unknown>, index?: number) => (
          <span className="text-text-tertiary text-xs">{(index ?? 0) + 1}</span>
        ),
        width: "40px",
      },
      {
        key: "nombre_completo",
        title: "Transportista",
        sortable: true,
        render: (record: Transportista & Record<string, unknown>) => (
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {record.nombre} {record.apellido}
            </p>
            <div className="md:hidden mt-1">
              <p className="text-xs text-text-tertiary">CI: {record.documento}</p>
              <p className="text-xs text-text-tertiary">{record.chapa_vehiculo}</p>
            </div>
          </div>
        ),
      },
      {
        key: "documento",
        title: "CI",
        dataIndex: "documento",
        sortable: true,
        responsive: ["md"],
      },
      {
        key: "telefono",
        title: "Teléfono",
        responsive: ["md"],
        render: (record: Transportista & Record<string, unknown>) =>
          record.telefono ? (
            <a
              href={`tel:${record.telefono}`}
              className="text-primary hover:underline flex items-center gap-1 text-sm"
            >
              <Phone size={12} />
              {record.telefono}
            </a>
          ) : (
            <span className="text-text-tertiary text-sm">-</span>
          ),
      },
      {
        key: "vehiculo",
        title: "Vehículo",
        responsive: ["lg"],
        render: (record: Transportista & Record<string, unknown>) => (
          <div className="text-sm">
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getColorVehiculo(record.tipo_vehiculo)}`}>
              {record.tipo_vehiculo}
            </span>
            {record.marca_vehiculo && (
              <p className="text-xs text-text-tertiary mt-1">{record.marca_vehiculo}</p>
            )}
          </div>
        ),
      },
      {
        key: "chapa",
        title: "Chapa",
        responsive: ["md"],
        render: (record: Transportista & Record<string, unknown>) => (
          <span className="text-sm font-medium text-text-primary">{record.chapa_vehiculo}</span>
        ),
      },
      {
        key: "capacidad",
        title: "Capacidad",
        responsive: ["lg"],
        render: (record: Transportista & Record<string, unknown>) => (
          <span className="text-sm text-text-primary">{record.capacidad_pasajeros} pasajeros</span>
        ),
      },
      {
        key: "pasajeros",
        title: "Pasajeros",
        render: (record: Transportista & Record<string, unknown>) => (
          <div className="flex items-center gap-1">
            <Users size={14} className="text-primary" />
            <span className="text-sm font-medium text-text-primary">
              {record._count?.pasajeros || 0}
            </span>
            <span className="text-xs text-text-tertiary">/ {record.capacidad_pasajeros}</span>
          </div>
        ),
      },
      {
        key: "estado",
        title: "Estado",
        responsive: ["md"],
        render: (record: Transportista & Record<string, unknown>) => (
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            record.estado ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          }`}>
            {record.estado ? "Activo" : "Inactivo"}
          </span>
        ),
      },
      {
        key: "acciones",
        title: "Acciones",
        width: "80px",
        render: (record: Transportista & Record<string, unknown>) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(RoutesConfig.transportesTransportistasDetalle(record.id));
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
    if (!transportistas) return { total: 0, activos: 0, totalPasajeros: 0, capacidadTotal: 0 };

    return {
      total: transportistas.length,
      activos: transportistas.filter((t) => t.estado).length,
      totalPasajeros: transportistas.reduce((acc, t) => acc + (t._count?.pasajeros || 0), 0),
      capacidadTotal: transportistas.reduce((acc, t) => acc + t.capacidad_pasajeros, 0),
    };
  }, [transportistas]);

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={campanaActual ? `Transportistas — ${campanaActual.nombre}` : "Transportistas"}
        subtitle="Gestiona los transportistas y sus vehículos"
        showDivider
      />

      {puedeCrear && (
        <div className="mb-4">
          <button
            onClick={() => navigate(RoutesConfig.transportesTransportistasCrear)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Registrar Transportista</span>
            <span className="md:hidden">Nuevo</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck size={14} className="text-primary" />
            <p className="text-xs text-text-tertiary">Total</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck size={14} className="text-success" />
            <p className="text-xs text-text-tertiary">Activos</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-success">{stats.activos}</p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-info" />
            <p className="text-xs text-text-tertiary">Pasajeros</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-info">{stats.totalPasajeros}</p>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-warning" />
            <p className="text-xs text-text-tertiary">Capacidad Total</p>
          </div>
          <p className="text-xl md:text-2xl font-bold text-warning">{stats.capacidadTotal}</p>
        </div>
      </div>

      <CTable<Transportista & Record<string, unknown>>
        data={(transportistas || []) as (Transportista & Record<string, unknown>)[]}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        searchable={true}
        pagination={true}
        defaultPageSize={25}
        onRowDoubleClick={(record) => navigate(RoutesConfig.transportesTransportistasDetalle(record.id))}
      />
    </div>
  );
};

export default TransportistasListaPage;