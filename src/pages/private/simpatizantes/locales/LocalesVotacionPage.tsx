import { useState, useMemo, type FC } from "react";
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@components";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { useAuth } from "@hooks/useAuth";
import type { LocalVotacion, MesaVotacion } from "@dto/reportes.types";
import { useLocalesVotacion } from "../hooks/useLocalesVotacion";

const BadgeIntencion: FC<{ label: string; valor: number; color: string }> = ({
  label,
  valor,
  color,
}) => (
  <div
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
  >
    <span>{valor}</span>
    <span>{label}</span>
  </div>
);

const MesaCard: FC<{ mesa: MesaVotacion }> = ({ mesa }) => {
  const porcentajeSeguro =
    mesa.total > 0 ? Math.round((mesa.seguros / mesa.total) * 100) : 0;

  return (
    <div className="bg-bg-base border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{mesa.mesa}</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            Mesa {mesa.mesa}
          </span>
        </div>
        <span className="text-lg font-bold text-text-primary">
          {mesa.total}
        </span>
      </div>

      <div className="w-full bg-border rounded-full h-1.5 mb-3">
        <div
          className="bg-success h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${porcentajeSeguro}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <BadgeIntencion
          label="Seguros"
          valor={mesa.seguros}
          color="bg-success/10 text-success"
        />
        <BadgeIntencion
          label="Probables"
          valor={mesa.probables}
          color="bg-warning/10 text-warning"
        />
        <BadgeIntencion
          label="Indecisos"
          valor={mesa.indecisos}
          color="bg-text-tertiary/10 text-text-tertiary"
        />
      </div>
    </div>
  );
};

const LocalCard: FC<{ local: LocalVotacion; defaultExpanded?: boolean }> = ({
  local,
  defaultExpanded = false,
}) => {
  const [expandido, setExpandido] = useState(defaultExpanded);

  const porcentajeSeguro =
    local.total > 0 ? Math.round((local.seguros / local.total) * 100) : 0;

  const porcentajeProbable =
    local.total > 0 ? Math.round((local.probables / local.total) * 100) : 0;

  return (
    <div className="bg-bg-content border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full text-left p-5 flex items-center justify-between hover:bg-bg-base transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <MapPin size={20} className="text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary truncate">
              {local.local}
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              {local.total_mesas} {local.total_mesas === 1 ? "mesa" : "mesas"}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary leading-none">
                {local.total}
              </p>
              <p className="text-xs text-text-tertiary mt-0.5">simpatizantes</p>
            </div>

            <div className="hidden md:flex flex-col gap-1">
              <BadgeIntencion
                label="Seguros"
                valor={local.seguros}
                color="bg-success/10 text-success"
              />
              <BadgeIntencion
                label="Probables"
                valor={local.probables}
                color="bg-warning/10 text-warning"
              />
            </div>
          </div>
        </div>

        <div className="ml-4 text-text-tertiary shrink-0">
          {expandido ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      <div className="px-5 pb-1">
        <div className="flex gap-0 h-2 rounded-full overflow-hidden bg-border">
          <div
            className="bg-success transition-all duration-500"
            style={{ width: `${porcentajeSeguro}%` }}
          />
          <div
            className="bg-warning transition-all duration-500"
            style={{ width: `${porcentajeProbable}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-tertiary mt-1 mb-3">
          <span>{porcentajeSeguro}% seguros</span>
          <span>{porcentajeProbable}% probables</span>
        </div>
      </div>

      {expandido && (
        <div className="px-5 pb-5">
          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Mesas de votación
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {local.mesas.map((mesa) => (
                <MesaCard key={mesa.mesa} mesa={mesa} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LocalesVotacionPage: FC = () => {
  const { campanaSeleccionada, campanaActual } = useCampanaSeleccionada();
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [expandirTodos, setExpandirTodos] = useState(false);

  const tienePermiso =
    usuario?.perfil?.permisos?.some(
      (p) => p.permiso.nombre === "ver_locales_votacion",
    ) ||
    usuario?.permisos_personalizados?.some(
      (p) => p.permiso.nombre === "ver_locales_votacion",
    ) ||
    usuario?.perfil?.nombre === "ROOT" ||
    false;

  const { data, isLoading, isError, refetch } = useLocalesVotacion({
    campana_id: campanaSeleccionada ?? "",
  });

  const localesFiltrados = useMemo(() => {
    if (!data?.locales) return [];
    if (!busqueda.trim()) return data.locales;
    return data.locales.filter((l) =>
      l.local.toLowerCase().includes(busqueda.toLowerCase()),
    );
  }, [data?.locales, busqueda]);

  if (!tienePermiso) {
    return (
      <div className="py-4 px-6">
        <PageHeader
          title="Locales de Votación"
          subtitle="Vista de mesas y locales de votación"
          showDivider
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={48} className="text-warning mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Sin acceso
          </h3>
          <p className="text-text-tertiary text-sm">
            No tenés permiso para ver esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={
          campanaActual
            ? `Locales de Votación — ${campanaActual.nombre}`
            : "Locales de Votación"
        }
        subtitle={
          data
            ? `Modo: ${data.modo_eleccion === "INTERNAS" ? "Elecciones Internas" : "Elecciones Generales"}`
            : "Cargando datos..."
        }
        showDivider
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-tertiary text-sm">
            Cargando locales de votación...
          </p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle size={48} className="text-danger mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Error al cargar datos
          </h3>
          <p className="text-text-tertiary text-sm mb-4">
            No se pudieron cargar los locales de votación.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : data ? (
        <>
          {/* Stats generales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-bg-content border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-tertiary text-xs font-medium">
                    Total Simpatizantes
                  </p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {data.total_simpatizantes}
                  </p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="text-primary" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-bg-content border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-tertiary text-xs font-medium">
                    Con Local Asignado
                  </p>
                  <p className="text-2xl font-bold text-success mt-1">
                    {data.total_con_local}
                  </p>
                </div>
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-success" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-bg-content border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-tertiary text-xs font-medium">
                    Sin Local Asignado
                  </p>
                  <p className="text-2xl font-bold text-warning mt-1">
                    {data.total_sin_local}
                  </p>
                </div>
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <HelpCircle className="text-warning" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-bg-content border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-tertiary text-xs font-medium">
                    Locales de Votación
                  </p>
                  <p className="text-2xl font-bold text-info mt-1">
                    {data.total_locales}
                  </p>
                </div>
                <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-info" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <MapPin
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
              />
              <input
                type="text"
                placeholder="Buscar local de votación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-bg-content text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={() => setExpandirTodos(!expandirTodos)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-primary hover:bg-bg-base transition-colors shrink-0"
            >
              {expandirTodos ? "Colapsar todos" : "Expandir todos"}
            </button>
          </div>

          {/* Lista de locales */}
          {localesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MapPin size={48} className="text-text-tertiary mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {busqueda
                  ? "No se encontraron locales con ese nombre"
                  : "No hay datos de locales de votación"}
              </h3>
              <p className="text-text-tertiary text-sm">
                {busqueda
                  ? "Intentá con otro término de búsqueda"
                  : "Los simpatizantes aún no tienen local de votación asignado"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {localesFiltrados.map((local) => (
                <LocalCard
                  key={local.local}
                  local={local}
                  defaultExpanded={expandirTodos}
                />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default LocalesVotacionPage;
