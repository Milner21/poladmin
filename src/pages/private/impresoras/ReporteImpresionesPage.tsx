import { CTable, PageHeader } from "@components";
import type { ColumnDef } from "@components/CTable";
import type {
  EstadisticasImpresionesDto,
  ReporteUsuarioImpresion,
} from "@dto/impresora.types";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { usePermisos } from "@hooks/usePermisos";
import RoutesConfig from "@routes/RoutesConfig";
import { impresorasService } from "@services/impresoras.service";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  FileSpreadsheet,
  Printer,
  Search,
  Truck,
} from "lucide-react";
import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";

interface StatCardSimple {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCardSimple: FC<StatCardSimple> = ({ title, value, icon, color }) => (
  <div className="bg-bg-content border border-border rounded-xl p-5">
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-sm text-text-secondary">{title}</p>
      </div>
    </div>
  </div>
);

const ReporteImpresionesPage: FC = () => {
  const navigate = useNavigate();
  const { campanaActual } = useCampanaSeleccionada();
  const { tienePermiso } = usePermisos();
  const [fechaDesde, setFechaDesde] = useState<string>("");

  const puedeVerReportes = tienePermiso("ver_reportes_impresion");

  const {
    data: estadisticas,
    isLoading: loadingEstadisticas,
    refetch: refetchEstadisticas,
  } = useQuery<EstadisticasImpresionesDto>({
    queryKey: ["impresiones", "estadisticas", fechaDesde],
    queryFn: () =>
      impresorasService.getEstadisticasImpresiones(
        fechaDesde || undefined
      ),
    enabled: puedeVerReportes,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: reporteUsuarios,
    isLoading: loadingReporte,
    refetch: refetchReporte,
  } = useQuery<ReporteUsuarioImpresion[]>({
    queryKey: ["impresiones", "reporte-usuarios", fechaDesde],
    queryFn: () =>
      impresorasService.getReporteUsuarios(fechaDesde || undefined),
    enabled: puedeVerReportes,
    staleTime: 5 * 60 * 1000,
  });

  const handleBuscar = () => {
    refetchEstadisticas();
    refetchReporte();
  };

  const handleLimpiar = () => {
    setFechaDesde("");
  };

  const columnas: ColumnDef<ReporteUsuarioImpresion>[] = [
    {
      key: "usuario",
      title: "Usuario",
      render: (row: ReporteUsuarioImpresion) => (
        <div>
          <p className="font-medium text-text-primary">
            {row.nombre} {row.apellido}
          </p>
          <p className="text-xs text-text-tertiary">{row.perfil}</p>
        </div>
      ),
    },
    {
      key: "total_ticket_padron",
      title: "Consulta Votante",
      render: (row: ReporteUsuarioImpresion) => (
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-info/10 text-info rounded-lg text-sm font-medium">
            <FileSpreadsheet size={14} />
            {row.total_ticket_padron}
          </span>
        </div>
      ),
    },
    {
      key: "total_ticket_transporte",
      title: "Tickets Transporte",
      render: (row: ReporteUsuarioImpresion) => (
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-warning/10 text-warning rounded-lg text-sm font-medium">
            <Truck size={14} />
            {row.total_ticket_transporte}
          </span>
        </div>
      ),
    },
    {
      key: "total_impresiones",
      title: "Total",
      render: (row: ReporteUsuarioImpresion) => (
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
            <Printer size={14} />
            {row.total_impresiones}
          </span>
        </div>
      ),
    },
    {
      key: "ultima_impresion",
      title: "Última Impresión",
      render: (row: ReporteUsuarioImpresion) => (
        <div className="text-center">
          {row.ultima_impresion ? (
            <p className="text-xs text-text-secondary">
              {new Date(row.ultima_impresion).toLocaleString("es-PY", {
                timeZone: "America/Sao_Paulo",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          ) : (
            <span className="text-xs text-text-tertiary">—</span>
          )}
        </div>
      ),
    },
  ];

  if (!puedeVerReportes) {
    return (
      <div className="p-6">
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-6 text-center">
          <p className="text-warning font-medium">
            No tenés permisos para ver reportes de impresión
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Reporte de Impresiones"
        subtitle={
          campanaActual
            ? `Tickets impresos en ${campanaActual.nombre}`
            : "Estadísticas de tickets impresos"
        }
      />

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => navigate(RoutesConfig.impresorasLista)}
          className="btn btn-outline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-bg-content border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-text-tertiary" />
            <label className="text-sm font-medium text-text-secondary">
              Desde:
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="input w-auto"
            />
          </div>

          <button
            onClick={handleBuscar}
            className="btn btn-primary flex items-center gap-2"
            disabled={loadingEstadisticas || loadingReporte}
          >
            {loadingEstadisticas || loadingReporte ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Search size={16} />
                Buscar
              </>
            )}
          </button>

          {fechaDesde && (
            <button
              onClick={handleLimpiar}
              className="btn btn-outline"
            >
              Limpiar filtro
            </button>
          )}
        </div>

        {fechaDesde && (
          <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
            <Calendar size={14} />
            Mostrando datos desde el{" "}
            {new Date(fechaDesde).toLocaleDateString("es-PY", {
              timeZone: "America/Sao_Paulo",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
      </div>

      {/* Cards de estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCardSimple
            title="Hoy"
            value={estadisticas.total_impresiones_hoy}
            icon={<Printer size={24} className="text-white" />}
            color="bg-primary"
          />
          <StatCardSimple
            title="Total"
            value={estadisticas.total_impresiones_acumulado}
            icon={<Printer size={24} className="text-white" />}
            color="bg-success"
          />
          <StatCardSimple
            title="Consulta Votante"
            value={estadisticas.total_ticket_padron}
            icon={<FileSpreadsheet size={24} className="text-white" />}
            color="bg-info"
          />
          <StatCardSimple
            title="Tickets Transporte"
            value={estadisticas.total_ticket_transporte}
            icon={<Truck size={24} className="text-white" />}
            color="bg-warning"
          />
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-bg-content border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">
            Impresiones por Usuario
          </h3>
          <p className="text-sm text-text-tertiary mt-1">
            Detalle de tickets impresos por cada usuario del sistema
          </p>
        </div>

        <CTable
          data={reporteUsuarios || []}
          columns={columnas}
          loading={loadingReporte}
          rowKey="usuario_id"
          pagination={true}
          defaultPageSize={20}
        />
      </div>
    </div>
  );
};

export default ReporteImpresionesPage;