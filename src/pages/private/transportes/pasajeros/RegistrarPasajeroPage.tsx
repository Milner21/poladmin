import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transportesService } from "@services/transportes.service";
import { useTransportistas } from "../hooks/useTransportistas";
import { ArrowLeft, Save, Search, AlertCircle, CheckCircle } from "lucide-react";
import RoutesConfig from "@routes/RoutesConfig";
import toast from "react-hot-toast";
import { simpatizantesService } from "@services/simpatizantes.service";
import type { ResultadoPadronDto } from "@dto/padron.types";

const RegistrarPasajeroPage: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: transportistas, isLoading: loadingTransportistas } = useTransportistas();

  const [transportistaId, setTransportistaId] = useState("");
  const [documento, setDocumento] = useState("");
  const [horaRecogida, setHoraRecogida] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [datoPadron, setDatoPadron] = useState<ResultadoPadronDto | null>(null);
  const [errorBusqueda, setErrorBusqueda] = useState("");

  const registrarMutation = useMutation({
    mutationFn: transportesService.registrarPasajero,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pasajeros"] });
      toast.success("Pasajero registrado correctamente");
      navigate(RoutesConfig.transportesPasajeros);
    },
    onError: (error: Error & { response?: { status: number; data?: { message?: string } } }) => {
      if (error.response?.status === 404) {
        setErrorBusqueda(
          "Documento no encontrado en padrón. Debe solicitar verificación al operador."
        );
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Capacidad del transportista alcanzada");
      } else {
        toast.error(error.message || "Error al registrar pasajero");
      }
    },
  });

  const handleBuscarPadron = async () => {
    if (!documento || documento.length < 3) {
      toast.error("Ingrese un documento válido");
      return;
    }

    setBuscando(true);
    setDatoPadron(null);
    setErrorBusqueda("");

    try {
      const resultado = await simpatizantesService.buscarPadron(documento);
      setDatoPadron(resultado);
      toast.success("Votante encontrado en padrón");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setErrorBusqueda(err.response?.data?.message || "Documento no encontrado en padrón");
      setDatoPadron(null);
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transportistaId) {
      toast.error("Seleccione un transportista");
      return;
    }

    if (!documento) {
      toast.error("Ingrese un documento");
      return;
    }

    registrarMutation.mutate({
      transportista_id: transportistaId,
      documento: documento,
      hora_recogida: horaRecogida || undefined,
    });
  };

  const handleSolicitarVerificacion = () => {
    toast("Funcionalidad de verificación en desarrollo", {
      icon: "ℹ️",
      duration: 3000,
    });
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Registrar Pasajero"
        subtitle="Registra un pasajero en un transporte"
        showDivider
      />

      <button
        onClick={() => navigate(RoutesConfig.transportesPasajeros)}
        className="btn btn-outline mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      <div className="max-w-2xl bg-bg-content border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Transportista <span className="text-danger">*</span>
            </label>
            <select
              value={transportistaId}
              onChange={(e) => setTransportistaId(e.target.value)}
              required
              disabled={loadingTransportistas}
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar transportista...</option>
              {transportistas?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} {t.apellido} - {t.chapa_vehiculo} (
                  {t._count?.pasajeros || 0}/{t.capacidad_pasajeros})
                </option>
              ))}
            </select>
          </div>

          <hr className="border-border my-6" />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Documento del Pasajero <span className="text-danger">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={documento}
                onChange={(e) => {
                  setDocumento(e.target.value);
                  setDatoPadron(null);
                  setErrorBusqueda("");
                }}
                required
                minLength={3}
                placeholder="Ingrese CI del votante"
                className="flex-1 px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleBuscarPadron}
                disabled={buscando || !documento}
                className="btn btn-primary flex items-center gap-2"
              >
                <Search size={16} />
                {buscando ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>

          {datoPadron && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-success" />
                <p className="text-sm font-medium text-success">Votante encontrado</p>
              </div>
              <div className="text-sm text-text-primary space-y-1">
                <p>
                  <strong>Nombre:</strong> {datoPadron.nombre} {datoPadron.apellido}
                </p>
                <p>
                  <strong>Local:</strong> {datoPadron.local_votacion || "-"}
                </p>
                <p>
                  <strong>Mesa:</strong> {datoPadron.mesa_votacion || "-"} | <strong>Orden:</strong>{" "}
                  {datoPadron.orden_votacion || "-"}
                </p>
              </div>
            </div>
          )}

          {errorBusqueda && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-danger" />
                <p className="text-sm font-medium text-danger">No encontrado</p>
              </div>
              <p className="text-sm text-text-primary mb-3">{errorBusqueda}</p>
              <button
                type="button"
                onClick={handleSolicitarVerificacion}
                className="btn btn-outline btn-sm"
              >
                Solicitar Verificación al Operador
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Hora de Recogida (Opcional)
            </label>
            <input
              type="time"
              value={horaRecogida}
              onChange={(e) => setHoraRecogida(e.target.value)}
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-text-tertiary mt-1">
              Si lo deja vacío, no se programará hora específica
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={registrarMutation.isPending || !datoPadron}
              className="btn btn-primary flex items-center gap-2 flex-1"
            >
              <Save size={16} />
              {registrarMutation.isPending ? "Registrando..." : "Registrar Pasajero"}
            </button>
            <button
              type="button"
              onClick={() => navigate(RoutesConfig.transportesPasajeros)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
          </div>

          {!datoPadron && (
            <p className="text-xs text-text-tertiary text-center">
              Debe buscar y encontrar al votante en el padrón antes de registrar
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegistrarPasajeroPage;