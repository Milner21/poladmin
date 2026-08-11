//src/pages/private/campanas/ConfiguracionListaPage.tsx
import { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@components";
import { usePermisos } from "@hooks/usePermisos";
import { Navigate } from "react-router-dom";
import { useCampanas } from "./hooks/useCampanas";
import { useAuth } from "@hooks/useAuth";
import RoutesConfig from "@routes/RoutesConfig";
import {
  Settings,
  Building2,
  Users,
  ChevronRight,
  CheckCircle,
  XCircle,
  Ticket,
  UserCheck,
  Heart,
} from "lucide-react";
import type { Campana } from "@dto/campana.types";

const ConfiguracionListaPage: FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { tienePermiso } = usePermisos();
  const { data: campanas, isLoading } = useCampanas();

  const esRoot = usuario?.perfil?.nombre === "ROOT";

  // Solo ROOT puede ver todas las campanas
  // Un usuario normal solo ve su propia campana
  const campanasFiltradas: Campana[] = esRoot
    ? campanas || []
    : campanas?.filter((c) => c.id === usuario?.campana_id) || [];

  const puedeVerConfiguracion = esRoot || tienePermiso("ver_campana");

  if (!puedeVerConfiguracion) {
    return <Navigate to={RoutesConfig.dashboard} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Configuración"
        subtitle="Selecciona una campaña para configurar"
        showDivider
      />

      {campanasFiltradas.length === 0 ? (
        <div className="bg-bg-content border border-border rounded-xl p-12 text-center">
          <Building2 size={48} className="mx-auto mb-4 text-text-tertiary opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No hay campañas disponibles
          </h3>
          <p className="text-sm text-text-tertiary">
            No se encontraron campañas para configurar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campanasFiltradas.map((campana) => (
            <button
              key={campana.id}
              onClick={() => navigate(RoutesConfig.configuracionDetalle(campana.id))}
              className="bg-bg-content border border-border hover:border-primary/50 hover:shadow-md rounded-xl p-5 text-left transition-all group"
            >
              {/* Header de la card */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                      {campana.nombre}
                    </h3>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {campana.tipo_campana} • {campana.nivel_campana}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-text-tertiary group-hover:text-primary transition-colors shrink-0 mt-1"
                />
              </div>

              {/* Info de la campana */}
              {(campana.departamento || campana.distrito) && (
                <p className="text-xs text-text-secondary mb-3">
                  {[campana.departamento, campana.distrito]
                    .filter(Boolean)
                    .join(" - ")}
                </p>
              )}

              {/* Contadores */}
              {campana._count && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Users size={13} className="text-text-tertiary" />
                    <span>{campana._count.usuarios} usuarios</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <Users size={13} className="text-text-tertiary" />
                    <span>{campana._count.simpatizantes} simpatizantes</span>
                  </div>
                </div>
              )}

              {/* Estado de modulos de tickets */}
              {campana.configuracion && (
                <div className="border-t border-border pt-3 space-y-1.5">
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-2">
                    Módulos activos
                  </p>

                  <div className="flex items-center gap-2">
                    {campana.configuracion.usar_activador_ticket ? (
                      <CheckCircle size={13} className="text-success" />
                    ) : (
                      <XCircle size={13} className="text-text-tertiary/50" />
                    )}
                    <Ticket size={12} className="text-text-tertiary" />
                    <span className={`text-xs ${campana.configuracion.usar_activador_ticket ? "text-text-primary" : "text-text-tertiary/50"}`}>
                      Activador de Tickets
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {campana.configuracion.usar_verificador_asistencia ? (
                      <CheckCircle size={13} className="text-success" />
                    ) : (
                      <XCircle size={13} className="text-text-tertiary/50" />
                    )}
                    <UserCheck size={12} className="text-text-tertiary" />
                    <span className={`text-xs ${campana.configuracion.usar_verificador_asistencia ? "text-text-primary" : "text-text-tertiary/50"}`}>
                      Verificador de Asistencia
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {campana.configuracion.usar_solidaridad ? (
                      <CheckCircle size={13} className="text-success" />
                    ) : (
                      <XCircle size={13} className="text-text-tertiary/50" />
                    )}
                    <Heart size={12} className="text-text-tertiary" />
                    <span className={`text-xs ${campana.configuracion.usar_solidaridad ? "text-text-primary" : "text-text-tertiary/50"}`}>
                      Solidaridad
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <Settings size={12} className="text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">
                      Método: <span className="font-medium text-text-secondary">{campana.configuracion.metodo_verificacion}</span>
                    </span>
                    <span className="text-xs text-text-tertiary ml-auto">
                      Modo: <span className="font-medium text-text-secondary">{campana.configuracion.modo_eleccion}</span>
                    </span>
                  </div>
                </div>
              )}

              {!campana.configuracion && (
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-text-tertiary">Sin configuración</p>
                </div>
              )}

              {/* Estado */}
              <div className="mt-3 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  campana.estado
                    ? "bg-success/10 text-success"
                    : "bg-text-tertiary/10 text-text-tertiary"
                }`}>
                  {campana.estado ? (
                    <CheckCircle size={11} />
                  ) : (
                    <XCircle size={11} />
                  )}
                  {campana.estado ? "Activa" : "Inactiva"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfiguracionListaPage;