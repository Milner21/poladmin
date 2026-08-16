// src/pages/private/simpatizantes/consulta-voto/ConsultaVotoPage.tsx

import { PageHeader } from "@components";
import { simpatizantesService } from "@services/simpatizantes.service";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Search, User, XCircle } from "lucide-react";
import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import RoutesConfig from "@routes/RoutesConfig";
import { usePermisos } from "@hooks/usePermisos";

interface ConsultaVotoResult {
  success: boolean;
  message: string;
  data: {
    nombre: string;
    apellido: string;
    documento: string;
    modo_eleccion: "INTERNAS" | "GENERALES";
    voto: boolean;
    fecha_voto: string | null;
    local_votacion: string | null;
    mesa_votacion: string | null;
    orden_votacion: string | null;
  } | null;
}

const ConsultaVotoPage: FC = () => {
  const navigate = useNavigate();
  const { tienePermiso } = usePermisos();
  const puedeConsultarVoto = tienePermiso("marcar_voto");
  const [ci, setCi] = useState("");
  const [resultado, setResultado] = useState<ConsultaVotoResult | null>(null);

  const consultaMutation = useMutation({
    mutationFn: (ci: string) => simpatizantesService.consultarVoto(ci),
    onSuccess: (data) => {
      setResultado(data as ConsultaVotoResult);
    },
  });

  const handleConsultar = () => {
    if (!ci.trim()) return;
    setResultado(null);
    consultaMutation.mutate(ci.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConsultar();
    }
  };

  const limpiar = () => {
    setCi("");
    setResultado(null);
  };

  if (!puedeConsultarVoto) {
    return (
      <div className="p-6">
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-6 text-center">
          <p className="text-warning font-medium">
            No tenés permisos para consultar estado de voto
          </p>
        </div>
      </div>
    );
  }

  const etiquetaModo =
    resultado?.data?.modo_eleccion === "INTERNAS"
      ? "Elecciones Internas"
      : "Elecciones Generales";

  const etiquetaModoCorta =
    resultado?.data?.modo_eleccion === "INTERNAS" ? "internas" : "generales";

  return (
    <div className="p-6">
      <PageHeader
        title="Consulta de Voto"
        subtitle="Verificar si un simpatizante ya ejerció su voto"
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

      <div className="bg-bg-content border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-64">
            <User size={16} className="text-text-tertiary" />
            <input
              type="text"
              placeholder="Ingresá el número de CI..."
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input flex-1"
              disabled={consultaMutation.isPending}
            />
          </div>

          <button
            onClick={handleConsultar}
            disabled={!ci.trim() || consultaMutation.isPending}
            className="btn btn-primary flex items-center gap-2"
          >
            {consultaMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Consultando...
              </>
            ) : (
              <>
                <Search size={16} />
                Consultar
              </>
            )}
          </button>

          {resultado && (
            <button onClick={limpiar} className="btn btn-outline">
              Limpiar
            </button>
          )}
        </div>
      </div>

      {resultado && (
        <div className="bg-bg-content border border-border rounded-xl p-6">
          {resultado.success ? (
            <>
              <div className="mb-6 pb-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  Datos del Votante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Nombre</p>
                    <p className="text-sm font-medium text-text-primary">
                      {resultado.data?.nombre} {resultado.data?.apellido}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">CI</p>
                    <p className="text-sm font-mono text-text-primary">
                      {resultado.data?.documento}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Local</p>
                    <p className="text-sm text-text-secondary">
                      {resultado.data?.local_votacion || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Mesa</p>
                    <p className="text-sm text-text-secondary">
                      {resultado.data?.mesa_votacion || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Estado de Voto
                </h3>

                <div className="bg-bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {resultado.data?.voto ? (
                      <CheckCircle className="text-success" size={20} />
                    ) : (
                      <XCircle className="text-text-tertiary" size={20} />
                    )}
                    <div>
                      <h4 className="font-medium text-text-primary">
                        {etiquetaModo}
                      </h4>
                      <p className="text-xs text-text-tertiary">
                        Estado del voto en el modo activo
                      </p>
                    </div>
                  </div>

                  {resultado.data?.voto ? (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                      <p className="text-sm font-medium text-success mb-1">
                        Ya votó en {etiquetaModoCorta}
                      </p>
                      {resultado.data.fecha_voto && (
                        <p className="text-xs text-text-secondary">
                          Fecha:{" "}
                          {new Date(
                            resultado.data.fecha_voto,
                          ).toLocaleDateString("es-PY", {
                            timeZone: "America/Sao_Paulo",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-text-tertiary/10 border border-text-tertiary/20 rounded-lg p-3">
                      <p className="text-sm text-text-tertiary">
                        No ha votado en {etiquetaModoCorta}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <XCircle className="text-danger mx-auto mb-3" size={48} />
              <p className="text-danger font-medium mb-2">
                {resultado.message}
              </p>
              <p className="text-text-tertiary text-sm">
                El documento no está registrado como simpatizante
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultaVotoPage;