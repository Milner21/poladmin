import { CFooter, PageHeader } from "@components";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { usePermisos } from "@hooks/usePermisos";
import { useEstadisticasUsuarios } from "@pages/private/usuarios/hooks/useEstadisticasUsuarios";
import {
  Car,
  FileSpreadsheet,
  MapPin,
  Network,
  Phone,
  PhoneOff,
  ThumbsUp,
  TrendingUp,
  UserCheck,
  UserRoundPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { useState, type FC } from "react";
import { EstadisticasUsuarios } from "./components/EstadisticasUsuarios";
import { IntencionVotoChart } from "./components/IntencionVotoChart";
import { LogsAuditoria } from "./components/LogsAuditoria";
import { MapaResumen } from "./components/MapaResumen";
import { SimpatizantesAreaChart } from "./components/simpatizantesAreaChart/simpatizantesAreaChart";
import { StatCard } from "./components/statCard/StatCard";
import { TopRegistradoresChart } from "./components/TopRegistradoresChart";
import { useDashboard } from "./hooks/useDashboard";

const Dashboard: FC = () => {
  const isMobile = window.innerWidth < 768;
  const fixedHeight = isMobile ? 200 : 280;
  const [filtroActivo, setFiltroActivo] = useState<string>("dia");
  const [seccionActiva, setSeccionActiva] = useState<
    "simpatizantes" | "usuarios"
  >("simpatizantes");

  const { campanaSeleccionada, campanaActual } = useCampanaSeleccionada();

  const { tienePermiso } = usePermisos();

  const puedeVerEquipo = tienePermiso("ver_equipo_dashboard");
  const puedeVerTopRegistradores = tienePermiso("ver_top_registradores");
  const puedeVerMapa = tienePermiso("ver_mapa_dashboard");
  const puedeVerOrigenRegistro = tienePermiso("ver_origen_registro");
  const puedeVerContactabilidad = tienePermiso("ver_contactabilidad");
  const puedeVerIndicadores = tienePermiso("ver_indicadores_dashboard");

  const {
    estadisticas,
    simpatizantesEvolucionDiaria,
    top10Registros,
    intencionVoto,
    isLoading,
    isRefetching,
    refetch,
  } = useDashboard();

  const { data: statsUsuarios } = useEstadisticasUsuarios(campanaSeleccionada);

  const obtenerValorPorFiltro = (filtro: string) => {
    switch (filtro) {
      case "dia":
        return estadisticas?.total_simpatizantes_hoy ?? 0;
      case "semana":
        return estadisticas?.total_simpatizantes_semana ?? 0;
      case "mes":
        return estadisticas?.total_simpatizantes_mes ?? 0;
      default:
        return estadisticas?.total_simpatizantes ?? 0;
    }
  };

  const transformedData =
    simpatizantesEvolucionDiaria?.map((item) => {
      const fecha = new Date(item.dia_inicio);
      const diaNombre = fecha.toLocaleDateString("es-PY", {
        day: "2-digit",
        month: "2-digit",
      });
      const diaFormateado = fecha.toLocaleDateString("es-PY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return {
        ...item,
        dia: diaFormateado,
        dia_nombre: diaNombre,
      };
    }) ?? [];

  const intencionVotoVacio = {
    seguro: 0,
    probable: 0,
    indeciso: 0,
    contrario: 0,
    total: 0,
  };

  // Barra de progreso reutilizable
  const BarraProgreso = ({
    valor,
    color,
  }: {
    valor: number;
    color: string;
  }) => (
    <div className="w-full bg-bg-base rounded-full h-1.5 mt-1">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(valor, 100)}%` }}
      />
    </div>
  );

  return (
    <div className="py-4 px-6 min-h-90 w-full max-w-full box-border flex flex-col overflow-hidden">
      <PageHeader
        title={
          campanaActual
            ? `Dashboard — ${campanaActual.nombre}`
            : "Dashboard General"
        }
        subtitle="Los datos se actualizan cada 10 min."
        showRefresh={true}
        onRefresh={refetch}
        isRefreshing={isRefetching}
        showDivider={true}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setSeccionActiva("simpatizantes")}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            seccionActiva === "simpatizantes"
              ? "text-primary"
              : "text-text-tertiary hover:text-text-primary"
          }`}
        >
          <div className="flex items-center gap-2">
            <UsersRound size={16} />
            Simpatizantes
          </div>
          {seccionActiva === "simpatizantes" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>

        {puedeVerEquipo && (
          <button
            onClick={() => setSeccionActiva("usuarios")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              seccionActiva === "usuarios"
                ? "text-primary"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              Equipo
            </div>
            {seccionActiva === "usuarios" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        )}
      </div>

      {seccionActiva === "simpatizantes" ? (
        <>
          {/* Fila 1 - Stats principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Simpatizantes Nuevos"
              value={obtenerValorPorFiltro(filtroActivo)}
              icon={<UserRoundPlus />}
              filtroActivo={filtroActivo}
              filtros={[
                {
                  label: "D",
                  value: "dia",
                  tooltip: "Hoy",
                  subtitulo: "hoy",
                  onClick: () => setFiltroActivo("dia"),
                },
                {
                  label: "S",
                  value: "semana",
                  tooltip: "Semana",
                  subtitulo: "esta semana",
                  onClick: () => setFiltroActivo("semana"),
                },
                {
                  label: "M",
                  value: "mes",
                  tooltip: "Mes",
                  subtitulo: "este mes",
                  onClick: () => setFiltroActivo("mes"),
                },
              ]}
            />

            <StatCard
              title="Total Simpatizantes"
              value={estadisticas?.total_simpatizantes ?? 0}
              icon={<UsersRound />}
              subtitulo="acumulado"
            />

            <StatCard
              title="Necesitan Transporte"
              value={estadisticas?.total_necesitan_transporte ?? 0}
              icon={<Car />}
              subtitulo={
                estadisticas
                  ? `${estadisticas.porcentaje_necesitan_transporte}% del total`
                  : "pendientes"
              }
            />

            <StatCard
              title="Mi Red"
              value={estadisticas?.total_mi_red ?? 0}
              icon={<Network />}
              subtitulo="usuarios activos"
            />
          </div>

          {/* Fila 2 - Estadisticas de calidad */}
          {(puedeVerOrigenRegistro ||
            puedeVerContactabilidad ||
            puedeVerIndicadores) && (
            <div
              className={`grid grid-cols-1 gap-4 mb-6 ${
                [
                  puedeVerOrigenRegistro,
                  puedeVerContactabilidad,
                  puedeVerIndicadores,
                ].filter(Boolean).length === 3
                  ? "lg:grid-cols-3"
                  : [
                        puedeVerOrigenRegistro,
                        puedeVerContactabilidad,
                        puedeVerIndicadores,
                      ].filter(Boolean).length === 2
                    ? "lg:grid-cols-2"
                    : ""
              }`}
            >
              {puedeVerOrigenRegistro && (
                <div className="bg-bg-content border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileSpreadsheet size={18} className="text-primary" />
                    <h3 className="text-sm font-semibold text-text-primary">
                      Origen de Registro
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-text-secondary">
                          Padron Interno
                        </span>
                        <span className="font-semibold text-text-primary">
                          {estadisticas?.total_padron_interno ?? 0}
                          <span className="text-text-tertiary font-normal ml-1">
                            ({estadisticas?.porcentaje_padron_interno ?? 0}%)
                          </span>
                        </span>
                      </div>
                      <BarraProgreso
                        valor={estadisticas?.porcentaje_padron_interno ?? 0}
                        color="bg-primary"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-text-secondary">
                          Padron General
                        </span>
                        <span className="font-semibold text-text-primary">
                          {estadisticas?.total_padron_general ?? 0}
                          <span className="text-text-tertiary font-normal ml-1">
                            ({estadisticas?.porcentaje_padron_general ?? 0}%)
                          </span>
                        </span>
                      </div>
                      <BarraProgreso
                        valor={estadisticas?.porcentaje_padron_general ?? 0}
                        color="bg-info"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-text-secondary">Manual</span>
                        <span className="font-semibold text-text-primary">
                          {estadisticas?.total_manual ?? 0}
                          <span className="text-text-tertiary font-normal ml-1">
                            ({estadisticas?.porcentaje_manual ?? 0}%)
                          </span>
                        </span>
                      </div>
                      <BarraProgreso
                        valor={estadisticas?.porcentaje_manual ?? 0}
                        color="bg-warning"
                      />
                    </div>
                  </div>
                </div>
              )}

              {puedeVerContactabilidad && (
                <div className="bg-bg-content border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Phone size={18} className="text-success" />
                    <h3 className="text-sm font-semibold text-text-primary">
                      Contactabilidad
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                          <Phone size={14} className="text-success" />
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary">
                            Con telefono
                          </p>
                          <p className="text-lg font-bold text-success">
                            {estadisticas?.total_con_telefono ?? 0}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {estadisticas?.porcentaje_contactables ?? 0}%
                      </span>
                    </div>
                    <BarraProgreso
                      valor={estadisticas?.porcentaje_contactables ?? 0}
                      color="bg-success"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center">
                          <PhoneOff size={14} className="text-danger" />
                        </div>
                        <div>
                          <p className="text-xs text-text-secondary">
                            Sin telefono
                          </p>
                          <p className="text-lg font-bold text-danger">
                            {estadisticas?.total_sin_telefono ?? 0}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-text-primary">
                        {estadisticas
                          ? (
                              100 - estadisticas.porcentaje_contactables
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {puedeVerIndicadores && (
                <div className="bg-bg-content border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-accent" />
                    <h3 className="text-sm font-semibold text-text-primary">
                      Indicadores Clave
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp size={13} className="text-success" />
                          <span className="text-xs text-text-secondary">
                            Voto probable
                          </span>
                        </div>
                        <span className="text-xs font-bold text-success">
                          {estadisticas?.total_voto_probable ?? 0}
                          <span className="text-text-tertiary font-normal ml-1">
                            ({estadisticas?.porcentaje_voto_probable ?? 0}%)
                          </span>
                        </span>
                      </div>
                      <BarraProgreso
                        valor={estadisticas?.porcentaje_voto_probable ?? 0}
                        color="bg-success"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-info" />
                          <span className="text-xs text-text-secondary">
                            Con GPS
                          </span>
                        </div>
                        <span className="text-xs font-bold text-info">
                          {estadisticas?.total_con_gps ?? 0}
                          <span className="text-text-tertiary font-normal ml-1">
                            ({estadisticas?.porcentaje_con_gps ?? 0}%)
                          </span>
                        </span>
                      </div>
                      <BarraProgreso
                        valor={estadisticas?.porcentaje_con_gps ?? 0}
                        color="bg-info"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Car size={13} className="text-warning" />
                          <span className="text-xs text-text-secondary">
                            Necesitan transporte
                          </span>
                        </div>
                        <span className="text-xs font-bold text-warning">
                          {estadisticas?.total_necesitan_transporte ?? 0}
                          <span className="text-text-tertiary font-normal ml-1">
                            (
                            {estadisticas?.porcentaje_necesitan_transporte ?? 0}
                            %)
                          </span>
                        </span>
                      </div>
                      <BarraProgreso
                        valor={
                          estadisticas?.porcentaje_necesitan_transporte ?? 0
                        }
                        color="bg-warning"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fila 3 - Intencion de voto */}
          <div className="mb-6">
            <IntencionVotoChart
              data={intencionVoto ?? intencionVotoVacio}
              isLoading={isLoading}
            />
          </div>

          {/* Fila 4 - Evolucion + Top registradores */}
          <div
            className={`grid grid-cols-1 gap-6 mb-6 ${
              puedeVerTopRegistradores ? "lg:grid-cols-2" : ""
            }`}
          >
            <div style={{ height: fixedHeight }}>
              <SimpatizantesAreaChart
                data={transformedData}
                title="Registros por dia"
              />
            </div>
            {puedeVerTopRegistradores && (
              <TopRegistradoresChart
                data={top10Registros ?? []}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Fila 5 - Mapa */}
          {puedeVerMapa && (
            <div className="bg-bg-content border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-text-primary m-0">
                    Mapa de Simpatizantes
                  </h3>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Ubicacion geografica con GPS registrado
                  </p>
                </div>
              </div>
              <MapaResumen campanaId={campanaSeleccionada} />
            </div>
          )}
        </>
      ) : (
        puedeVerEquipo && (
          <>
            {/* Stats usuarios */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Usuarios"
                value={statsUsuarios?.total ?? 0}
                icon={<Users />}
              />
              <StatCard
                title="Usuarios Activos"
                value={statsUsuarios?.activos ?? 0}
                icon={<UserCheck />}
                subtitulo={`${statsUsuarios?.inactivos ?? 0} inactivos`}
              />
              <StatCard
                title="Operativos"
                value={statsUsuarios?.operativos ?? 0}
                icon={<UserRoundPlus />}
              />
              <StatCard
                title="Politicos"
                value={
                  (statsUsuarios?.total ?? 0) - (statsUsuarios?.operativos ?? 0)
                }
                icon={<TrendingUp />}
                subtitulo="Con nivel jerarquico"
              />
            </div>

            <EstadisticasUsuarios />

            <div className="mt-6">
              <LogsAuditoria />
            </div>
          </>
        )
      )}

      <div className="mt-auto pt-6">
        <CFooter />
      </div>
    </div>
  );
};

export default Dashboard;
