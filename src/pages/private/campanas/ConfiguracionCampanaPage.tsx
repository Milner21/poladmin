import { PageHeader } from "@components";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import {
    AlertCircle,
    Lock,
    Printer,
    Settings,
    UserPlus,
    Users,
} from "lucide-react";
import { useEffect, useState, type FC } from "react";
import {
    useActualizarConfiguracionTransporte,
    useConfiguracionTransporte,
} from "../transportes/hooks/useConfiguacionTransporte";
import {
    useActualizarConfiguracionCampana,
    useConfiguracionCampana,
} from "./hooks/useConfiguracionCampana";

const ConfiguracionCampanaPage: FC = () => {
  const { campanaSeleccionada, esRoot } = useCampanaSeleccionada();

  const campanaIdFinal = esRoot ? campanaSeleccionada : "";

  const { data: campana, isLoading: isLoadingCampana } =
    useConfiguracionCampana(campanaIdFinal);
  const { data: configTransporte, isLoading: isLoadingTransporte } =
    useConfiguracionTransporte();

  const actualizarCampanaMutation =
    useActualizarConfiguracionCampana(campanaIdFinal);
  const actualizarTransporteMutation = useActualizarConfiguracionTransporte();

  const [permitirDuplicadosSimpatizantes, setPermitirDuplicadosSimpatizantes] =
    useState(false);
  const [permitirRegistroManual, setPermitirRegistroManual] = useState(false);
  const [permitirImpresion, setPermitirImpresion] = useState(false);
  const [permitirDuplicadosTransporte, setPermitirDuplicadosTransporte] =
    useState(true);

  useEffect(() => {
    if (campana?.configuracion) {
      setPermitirDuplicadosSimpatizantes(
        campana.configuracion.permitir_duplicados_simpatizantes,
      );
      setPermitirRegistroManual(
        campana.configuracion.permitir_registro_manual_fuera_padron,
      );
    }
  }, [campana]);

  useEffect(() => {
    if (configTransporte) {
      setPermitirImpresion(configTransporte.permitir_impresion_tickets);
      setPermitirDuplicadosTransporte(configTransporte.permitir_duplicados);
    }
  }, [configTransporte]);

  const handleGuardarCampana = () => {
    actualizarCampanaMutation.mutate({
      permitir_duplicados_simpatizantes: permitirDuplicadosSimpatizantes,
      permitir_registro_manual_fuera_padron: permitirRegistroManual,
    });
  };

  const handleGuardarTransporte = () => {
    actualizarTransporteMutation.mutate({
      permitir_impresion_tickets: permitirImpresion,
      permitir_duplicados: permitirDuplicadosTransporte,
    });
  };

  const isLoading = isLoadingCampana || isLoadingTransporte;

  if (isLoading) {
    return (
      <div className="py-4 px-6 flex justify-center items-center min-h-64">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (esRoot && !campanaSeleccionada) {
    return (
      <div className="py-4 px-6">
        <PageHeader
          title="Configuración"
          subtitle="Ajustá las opciones de la campaña"
          showDivider
        />
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-warning shrink-0" />
          <p className="text-sm text-text-primary">
            Seleccioná una campaña en el selector superior para ver su
            configuración.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Configuración"
        subtitle="Ajustá las opciones de la campaña"
        showDivider
      />

      {!esRoot && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Lock size={16} className="text-warning shrink-0" />
          <p className="text-sm text-text-primary">
            Solo el usuario <strong>ROOT</strong> puede modificar esta
            configuración.
          </p>
        </div>
      )}

      <div className="max-w-lg space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Simpatizantes
          </h2>
          <div className="space-y-4">
            <div
              className={`bg-bg-content border rounded-xl p-5 ${!esRoot ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center shrink-0">
                    <Users size={18} className="text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Permitir Simpatizantes Duplicados
                    </p>
                    <p className="text-sm text-text-tertiary mt-1">
                      Si está activo, se registrará el intento de duplicado para
                      auditoría. Si está inactivo, se bloqueará el registro de
                      una persona ya registrada.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!esRoot}
                  onClick={() =>
                    setPermitirDuplicadosSimpatizantes(
                      !permitirDuplicadosSimpatizantes,
                    )
                  }
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                    permitirDuplicadosSimpatizantes
                      ? "bg-primary"
                      : "bg-text-tertiary/30"
                  } disabled:cursor-not-allowed`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      permitirDuplicadosSimpatizantes
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div
                className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                  permitirDuplicadosSimpatizantes
                    ? "bg-warning/10 text-warning"
                    : "bg-success/10 text-success"
                }`}
              >
                {permitirDuplicadosSimpatizantes
                  ? "Se auditarán los intentos de registro duplicado"
                  : "No se permiten registros duplicados"}
              </div>
            </div>

            <div
              className={`bg-bg-content border rounded-xl p-5 ${!esRoot ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <UserPlus size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Permitir Registro Manual
                    </p>
                    <p className="text-sm text-text-tertiary mt-1">
                      Si está activo, se podrán registrar simpatizantes que no
                      figuren en el padrón, sujeto a aprobación de un gestor.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!esRoot}
                  onClick={() =>
                    setPermitirRegistroManual(!permitirRegistroManual)
                  }
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                    permitirRegistroManual
                      ? "bg-primary"
                      : "bg-text-tertiary/30"
                  } disabled:cursor-not-allowed`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      permitirRegistroManual ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div
                className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                  permitirRegistroManual
                    ? "bg-primary/10 text-primary"
                    : "bg-text-tertiary/10 text-text-tertiary"
                }`}
              >
                {permitirRegistroManual
                  ? "Registro manual habilitado con aprobación de gestor"
                  : "Solo se permiten registros desde el padrón"}
              </div>
            </div>
          </div>

          {esRoot && (
            <button
              onClick={handleGuardarCampana}
              disabled={actualizarCampanaMutation.isPending}
              className="w-full mt-4 btn btn-primary flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              {actualizarCampanaMutation.isPending
                ? "Guardando..."
                : "Guardar configuración de simpatizantes"}
            </button>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Transporte
          </h2>
          <div className="space-y-4">
            <div
              className={`bg-bg-content border rounded-xl p-5 ${!esRoot ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Printer size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Impresión de Tickets
                    </p>
                    <p className="text-sm text-text-tertiary mt-1">
                      Si está activo, se habilitará la impresión térmica de
                      tickets al confirmar un pasajero.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!esRoot}
                  onClick={() => setPermitirImpresion(!permitirImpresion)}
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                    permitirImpresion ? "bg-primary" : "bg-text-tertiary/30"
                  } disabled:cursor-not-allowed`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      permitirImpresion ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div
                className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                  permitirImpresion
                    ? "bg-success/10 text-success"
                    : "bg-text-tertiary/10 text-text-tertiary"
                }`}
              >
                {permitirImpresion
                  ? "Impresión térmica habilitada"
                  : "Se usará carrusel de datos para registro manual"}
              </div>
            </div>

            <div
              className={`bg-bg-content border rounded-xl p-5 ${!esRoot ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center shrink-0">
                    <Users size={18} className="text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Permitir Pasajeros Duplicados
                    </p>
                    <p className="text-sm text-text-tertiary mt-1">
                      Un votante puede aparecer en más de un transporte si está
                      activo.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!esRoot}
                  onClick={() =>
                    setPermitirDuplicadosTransporte(
                      !permitirDuplicadosTransporte,
                    )
                  }
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                    permitirDuplicadosTransporte
                      ? "bg-primary"
                      : "bg-text-tertiary/30"
                  } disabled:cursor-not-allowed`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      permitirDuplicadosTransporte
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div
                className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                  permitirDuplicadosTransporte
                    ? "bg-warning/10 text-warning"
                    : "bg-success/10 text-success"
                }`}
              >
                {permitirDuplicadosTransporte
                  ? "Un votante puede estar en múltiples transportes"
                  : "No se permiten registros duplicados"}
              </div>
            </div>
          </div>

          {esRoot && (
            <button
              onClick={handleGuardarTransporte}
              disabled={actualizarTransporteMutation.isPending}
              className="w-full mt-4 btn btn-primary flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              {actualizarTransporteMutation.isPending
                ? "Guardando..."
                : "Guardar configuración de transporte"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionCampanaPage;
