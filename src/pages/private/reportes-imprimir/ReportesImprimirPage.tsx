import { useState, type FC } from "react";
import { PageHeader } from "@components";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import { ReporteCard } from "./components/ReporteCard";
import { ConfigurarReporteUsuariosModal } from "./components/ConfigurarReporteUsuariosModal";
import {
  BarChart3,
  FileDown,
  MapPin,
  TrendingUp,
  Truck,
  Users,
  UsersRound,
} from "lucide-react";
import { ConfigurarReporteSimpatizantesModal } from "./components/ConfigurarReporteSimpatizantesModal";
import { ConfigurarReporteRedJerarquicaModal } from "./components/ConfigurarReporteRedJerarquicaModal";

type TipoReporte =
  | "usuarios"
  | "simpatizantes"
  | "transportes"
  | "estadisticas";

const ReportesImprimirPage: FC = () => {
  const { campanaActual } = useCampanaSeleccionada();
  const [tabActiva, setTabActiva] = useState<TipoReporte>("usuarios");
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoReporteModal, setTipoReporteModal] = useState<string>("");

  const handleGenerarReporte = (tipo: string) => {
    setTipoReporteModal(tipo);
    setModalVisible(true);
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setTipoReporteModal("");
  };

  const tabs = [
    { key: "usuarios" as const, label: "Usuarios", icon: <Users size={16} /> },
    {
      key: "simpatizantes" as const,
      label: "Simpatizantes",
      icon: <UsersRound size={16} />,
    },
    {
      key: "transportes" as const,
      label: "Transportes",
      icon: <FileDown size={16} />,
      disabled: true,
    },
    {
      key: "estadisticas" as const,
      label: "Estadísticas",
      icon: <FileDown size={16} />,
      disabled: true,
    },
  ];

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={
          campanaActual
            ? `Exportar Reportes — ${campanaActual.nombre}`
            : "Exportar Reportes"
        }
        subtitle="Generá y exportá reportes del sistema en PDF y Excel"
        showDivider
      />

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => !tab.disabled && setTabActiva(tab.key)}
                disabled={tab.disabled}
                className={`
                  flex items-center gap-2 py-2 px-1 border-b-2 text-sm font-medium transition-colors
                  ${
                    tabActiva === tab.key
                      ? "border-primary text-primary"
                      : tab.disabled
                        ? "border-transparent text-text-tertiary cursor-not-allowed opacity-50"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                {tab.disabled && (
                  <span className="text-xs bg-bg-base text-text-tertiary px-2 py-0.5 rounded">
                    Próximamente
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content por tab */}
      <div className="space-y-6">
        {tabActiva === "usuarios" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReporteCard
              icon={<Users size={24} />}
              titulo="Listado de Usuarios"
              descripcion="Exportá un listado completo de usuarios de tu red jerárquica con información detallada."
              filtros={[
                "Por perfil/tipo de usuario",
                "Por estado (activo/inactivo)",
                "Por nivel jerárquico",
                "Por candidato superior",
              ]}
              onGenerar={() => handleGenerarReporte("usuarios-listado")}
            />

            <ReporteCard
              icon={<UsersRound size={24} />}
              titulo="Red Jerárquica"
              descripcion="Visualizá la estructura organizacional de usuarios agrupada por niveles y candidatos superiores."
              filtros={[
                "Agrupación por nivel",
                "Agrupación por candidato",
                "Solo usuarios activos",
                "Incluir información de contacto",
              ]}
              onGenerar={() => handleGenerarReporte("usuarios-red")}
            />

            <ReporteCard
              icon={<FileDown size={24} />}
              titulo="Resumen por Perfil"
              descripcion="Estadísticas y conteos de usuarios agrupados por tipo de perfil y nivel."
              filtros={[
                "Conteo por perfil",
                "Distribución por nivel",
                "Usuarios operativos vs políticos",
                "Análisis de actividad",
              ]}
              onGenerar={() => handleGenerarReporte("usuarios-resumen")}
              proximamente
            />
          </div>
        )}

        {tabActiva === "simpatizantes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReporteCard
              icon={<UsersRound size={24} />}
              titulo="Listado de Simpatizantes"
              descripcion="Exportá un listado completo de simpatizantes con filtros avanzados por ubicación, intención de voto y más."
              filtros={[
                "Por candidato/registrador",
                "Por fecha de registro",
                "Por ubicación geográfica",
                "Por intención de voto",
                "Por necesidad de transporte",
              ]}
              onGenerar={() => handleGenerarReporte("simpatizantes-listado")}
            />

            <ReporteCard
              icon={<TrendingUp size={24} />}
              titulo="Reporte por Intención de Voto"
              descripcion="Análisis detallado de la intención de voto de simpatizantes agrupado por categorías."
              filtros={[
                "Seguros vs Probables vs Indecisos",
                "Distribución geográfica",
                "Evolución temporal",
                "Análisis por candidato",
              ]}
              onGenerar={() => handleGenerarReporte("simpatizantes-intencion")}
              proximamente
            />

            <ReporteCard
              icon={<MapPin size={24} />}
              titulo="Reporte Geográfico"
              descripcion="Distribución de simpatizantes por departamento, distrito y barrio con análisis de densidad."
              filtros={[
                "Agrupación por departamento",
                "Agrupación por distrito/barrio",
                "Densidad por zona",
                "Cobertura geográfica",
              ]}
              onGenerar={() => handleGenerarReporte("simpatizantes-geografico")}
              proximamente
            />

            <ReporteCard
              icon={<BarChart3 size={24} />}
              titulo="Top Registradores"
              descripcion="Ranking de usuarios que más simpatizantes han registrado en el período seleccionado."
              filtros={[
                "Por período de tiempo",
                "Por nivel jerárquico",
                "Solo usuarios activos",
                "Incluir estadísticas",
              ]}
              onGenerar={() => handleGenerarReporte("simpatizantes-top")}
              proximamente
            />
          </div>
        )}

        {tabActiva === "transportes" && (
          <div className="text-center py-20">
            <Truck size={64} className="mx-auto text-text-tertiary mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Reportes de Transportes
            </h3>
            <p className="text-text-tertiary">
              Esta sección estará disponible próximamente con reportes de
              pasajeros, viajes y verificaciones.
            </p>
          </div>
        )}

        {tabActiva === "estadisticas" && (
          <div className="text-center py-20">
            <BarChart3 size={64} className="mx-auto text-text-tertiary mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Reportes Estadísticos
            </h3>
            <p className="text-text-tertiary">
              Esta sección estará disponible próximamente con gráficos y
              análisis avanzados.
            </p>
          </div>
        )}
      </div>

      {/* Modales */}
      {modalVisible && tipoReporteModal === "usuarios-listado" && (
        <ConfigurarReporteUsuariosModal
          visible={modalVisible}
          onClose={handleCerrarModal}
        />
      )}

      {modalVisible && tipoReporteModal === "simpatizantes-listado" && (
        <ConfigurarReporteSimpatizantesModal
          visible={modalVisible}
          onClose={handleCerrarModal}
        />
      )}

      {modalVisible && tipoReporteModal === "usuarios-red" && (
        <ConfigurarReporteRedJerarquicaModal
          visible={modalVisible}
          onClose={handleCerrarModal}
        />
      )}
    </div>
  );
};

export default ReportesImprimirPage;
