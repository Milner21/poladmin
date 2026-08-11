import { PageHeader } from "@components";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { usePermisos } from "@hooks/usePermisos";
import RoutesConfig from "@routes/RoutesConfig";
import { simpatizantesService } from "@services/simpatizantes.service";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Users,
  Vote,
  XCircle,
} from "lucide-react";
import { type FC } from "react";
import { useNavigate } from "react-router-dom";

interface StatCardVotacion {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

const StatCardVotacion: FC<StatCardVotacion> = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-bg-content border border-border rounded-xl p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
      </div>
    </div>
    <p className="text-xs text-text-tertiary">{subtitle}</p>
  </div>
);

const DashboardVotacionPage: FC = () => {
  const navigate = useNavigate();
  const { campanaActual } = useCampanaSeleccionada();
  const { tienePermiso } = usePermisos();
  
  const puedeVerEstadisticas = tienePermiso("marcar_voto");

  const {
    data: estadisticas,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["simpatizantes", "estadisticas-votacion"],
    queryFn: simpatizantesService.getEstadisticasVotacion,
    enabled: puedeVerEstadisticas,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  if (!puedeVerEstadisticas) {
    return (
      <div className="p-6">
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-6 text-center">
          <p className="text-warning font-medium">
            No tenés permisos para ver estadísticas de votación
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!estadisticas?.success || !estadisticas.data) {
    return (
      <div className="p-6">
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-6 text-center">
          <p className="text-danger font-medium">
            Error al cargar estadísticas de votación
          </p>
        </div>
      </div>
    );
  }

  const stats = estadisticas.data;

  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard de Votación"
        subtitle={
          campanaActual
            ? `Control de votos en ${campanaActual.nombre}`
            : "Estadísticas de participación electoral"
        }
        showRefresh={true}
        onRefresh={refetch}
      />

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => navigate(RoutesConfig.simpatizantesLista)}
          className="btn btn-outline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      {/* Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCardVotacion
          title="Total Simpatizantes"
          value={stats.total_simpatizantes}
          subtitle="Registrados en el padrón"
          icon={<Users size={24} className="text-white" />}
          color="bg-primary"
        />
        
        <StatCardVotacion
          title="Votantes Internas"
          value={stats.votantes_internas}
          subtitle={`${stats.porcentaje_participacion_internas}% de participación`}
          icon={<CheckCircle size={24} className="text-white" />}
          color="bg-success"
        />
        
        <StatCardVotacion
          title="Votantes Generales"
          value={stats.votantes_generales}
          subtitle={`${stats.porcentaje_participacion_generales}% de participación`}
          icon={<Vote size={24} className="text-white" />}
          color="bg-info"
        />
        
        <StatCardVotacion
          title="Votaron en Ambas"
          value={stats.votantes_ambas}
          subtitle={`${stats.porcentaje_votantes_completos}% del total`}
          icon={<CheckCircle size={24} className="text-white" />}
          color="bg-accent"
        />
      </div>

      {/* Cards de hoy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-bg-content border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Votos de Hoy</h3>
              <p className="text-sm text-text-tertiary">Actividad del día actual</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{stats.votantes_hoy_internas}</p>
              <p className="text-xs text-text-secondary">Internas hoy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-info">{stats.votantes_hoy_generales}</p>
              <p className="text-xs text-text-secondary">Generales hoy</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-content border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-danger rounded-lg flex items-center justify-center">
              <XCircle size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Pendientes</h3>
              <p className="text-sm text-text-tertiary">Aún no han votado</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-danger">{stats.pendientes_internas}</p>
              <p className="text-xs text-text-secondary">Sin voto internas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-danger">{stats.pendientes_generales}</p>
              <p className="text-xs text-text-secondary">Sin voto generales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen visual */}
      <div className="bg-bg-content border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Resumen de Participación</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Internas */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-text-secondary">Elecciones Internas</span>
              <span className="text-sm font-bold text-success">{stats.porcentaje_participacion_internas}%</span>
            </div>
            <div className="w-full bg-bg-base rounded-full h-3">
              <div
                className="bg-success h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.porcentaje_participacion_internas, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-tertiary mt-1">
              <span>{stats.votantes_internas} votaron</span>
              <span>{stats.pendientes_internas} pendientes</span>
            </div>
          </div>

          {/* Generales */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-text-secondary">Elecciones Generales</span>
              <span className="text-sm font-bold text-info">{stats.porcentaje_participacion_generales}%</span>
            </div>
            <div className="w-full bg-bg-base rounded-full h-3">
              <div
                className="bg-info h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.porcentaje_participacion_generales, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-tertiary mt-1">
              <span>{stats.votantes_generales} votaron</span>
              <span>{stats.pendientes_generales} pendientes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardVotacionPage;