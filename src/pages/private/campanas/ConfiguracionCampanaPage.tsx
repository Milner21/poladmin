//src/pages/private/campanas/ConfiguracionCampanaPage.tsx
import { PageHeader } from "@components";
import { useAuth } from "@hooks/useAuth";
import RoutesConfig from "@routes/RoutesConfig";
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Lock,
  Printer,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState, type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useActualizarConfiguracionTransporte,
  useConfiguracionTransporte,
} from "../transportes/hooks/useConfiguacionTransporte";
import {
  useActualizarConfiguracionCampana,
  useConfiguracionCampana,
} from "./hooks/useConfiguracionCampana";

const ConfiguracionCampanaPage: FC = () => {
  const { campanaId } = useParams<{ campanaId: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const esRoot = usuario?.perfil?.nombre === "ROOT";

  const campanaIdFinal = campanaId || "";

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
  const [usarActivadorTicket, setUsarActivadorTicket] = useState(false);
  const [usarVerificadorAsistencia, setUsarVerificadorAsistencia] =
    useState(false);
  const [usarSolidaridad, setUsarSolidaridad] = useState(false);
  const [metodoVerificacion, setMetodoVerificacion] = useState<"PIN" | "QR">(
    "PIN",
  );
  const [ticketLinea1, setTicketLinea1] = useState("");
  const [ticketLinea2, setTicketLinea2] = useState("");
  const [ticketLinea3, setTicketLinea3] = useState("");

  useEffect(() => {
    if (campana?.configuracion) {
      setPermitirDuplicadosSimpatizantes(
        campana.configuracion.permitir_duplicados_simpatizantes,
      );
      setPermitirRegistroManual(
        campana.configuracion.permitir_registro_manual_fuera_padron,
      );
      setTicketLinea1(campana.configuracion.ticket_header_linea1 ?? "");
      setTicketLinea2(campana.configuracion.ticket_header_linea2 ?? "");
      setTicketLinea3(campana.configuracion.ticket_header_linea3 ?? "");
      setUsarActivadorTicket(
        campana.configuracion.usar_activador_ticket || false,
      );
      setUsarVerificadorAsistencia(
        campana.configuracion.usar_verificador_asistencia || false,
      );
      setUsarSolidaridad(campana.configuracion.usar_solidaridad || false);
      setMetodoVerificacion(campana.configuracion.metodo_verificacion || "PIN");
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

  const handleGuardarTicketHeader = () => {
    actualizarCampanaMutation.mutate({
      ticket_header_linea1: ticketLinea1 || undefined,
      ticket_header_linea2: ticketLinea2 || undefined,
      ticket_header_linea3: ticketLinea3 || undefined,
    });
  };

  const handleGuardarTransporte = () => {
    actualizarTransporteMutation.mutate({
      permitir_impresion_tickets: permitirImpresion,
      permitir_duplicados: permitirDuplicadosTransporte,
    });
  };

  const handleGuardarTickets = () => {
    actualizarCampanaMutation.mutate({
      usar_activador_ticket: usarActivadorTicket,
      usar_verificador_asistencia: usarVerificadorAsistencia,
      usar_solidaridad: usarSolidaridad,
      metodo_verificacion: metodoVerificacion,
    });
  };

  const isLoading = isLoadingCampana || isLoadingTransporte;

  if (!campanaIdFinal) {
    return (
      <div className="py-4 px-6">
        <PageHeader
          title="Configuración"
          subtitle="Selecciona una campaña para configurar"
          showDivider
        />
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-warning shrink-0" />
          <p className="text-sm text-text-primary">
            No se encontró la campaña. Volvé al listado de configuración.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-4 px-6 flex justify-center items-center min-h-64">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4 px-6">
      {/* Boton volver y titulo con nombre de campana */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate(RoutesConfig.configuracion)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-surface transition-colors"
          title="Volver al listado"
        >
          <ArrowLeft size={20} className="text-text-tertiary" />
        </button>
        <div>
          <PageHeader
            title={`Configuración: ${campana?.nombre || "Cargando..."}`}
            subtitle={
              campana
                ? `${campana.tipo_campana} • ${campana.nivel_campana}${campana.departamento ? ` • ${campana.departamento}` : ""}${campana.distrito ? ` - ${campana.distrito}` : ""}`
                : "Cargando datos de la campaña..."
            }
            showDivider
          />
        </div>
      </div>

      {/* Modo de eleccion actual */}
      {campana?.configuracion && (
        <div className="mb-6 flex items-center gap-2">
          <span
            className={`inline-block px-3 py-1.5 text-xs font-medium rounded-lg ${
              campana.configuracion.modo_eleccion === "INTERNAS"
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-success/10 text-success border border-success/30"
            }`}
          >
            Modo: {campana.configuracion.modo_eleccion}
          </span>
          {campana.partido && (
            <span className="inline-block px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-surface text-text-secondary border border-border">
              Partido: {campana.partido.nombre} ({campana.partido.sigla})
            </span>
          )}
        </div>
      )}

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
        {/* ==========================================
            SIMPATIZANTES
        ========================================== */}
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

        {/* ==========================================
            HEADER DEL TICKET DE IMPRESION
        ========================================== */}
        <div>
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Header del Ticket de Impresión
          </h2>

          <div
            className={`bg-bg-content border rounded-xl p-5 space-y-4 ${!esRoot ? "opacity-60" : ""}`}
          >
            <div className="flex items-start gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">
                  Texto de propaganda política
                </p>
                <p className="text-sm text-text-tertiary mt-1">
                  Estas líneas aparecerán en la parte superior de cada ticket
                  impreso. Podés usar hasta 3 líneas de texto.
                </p>
              </div>
            </div>

            <div>
              <label className="label">Línea 1</label>
              <input
                type="text"
                className="input"
                placeholder="Ej: MOVIMIENTO FUERZA REPUBLICANA"
                maxLength={50}
                disabled={!esRoot}
                value={ticketLinea1}
                onChange={(e) => setTicketLinea1(e.target.value)}
              />
              <p className="text-xs text-text-tertiary mt-1">
                {ticketLinea1.length}/50 caracteres
              </p>
            </div>

            <div>
              <label className="label">Línea 2</label>
              <input
                type="text"
                className="input"
                placeholder="Ej: HUGO VELAZQUEZ INTENDENTE"
                maxLength={50}
                disabled={!esRoot}
                value={ticketLinea2}
                onChange={(e) => setTicketLinea2(e.target.value)}
              />
              <p className="text-xs text-text-tertiary mt-1">
                {ticketLinea2.length}/50 caracteres
              </p>
            </div>

            <div>
              <label className="label">Línea 3</label>
              <input
                type="text"
                className="input"
                placeholder="Ej: ¡JUNTOS POR CIUDAD DEL ESTE!"
                maxLength={50}
                disabled={!esRoot}
                value={ticketLinea3}
                onChange={(e) => setTicketLinea3(e.target.value)}
              />
              <p className="text-xs text-text-tertiary mt-1">
                {ticketLinea3.length}/50 caracteres
              </p>
            </div>

            {(ticketLinea1 || ticketLinea2 || ticketLinea3) && (
              <div className="bg-bg-surface border border-border rounded-lg p-4">
                <p className="text-xs text-text-tertiary mb-3 font-semibold uppercase">
                  Vista previa del header
                </p>
                <div className="font-mono text-xs border border-dashed border-border rounded p-3 space-y-1 text-center">
                  {ticketLinea1 && (
                    <p className="font-bold text-text-primary">
                      {ticketLinea1.toUpperCase()}
                    </p>
                  )}
                  {ticketLinea2 && (
                    <p className="text-text-secondary">
                      {ticketLinea2.toUpperCase()}
                    </p>
                  )}
                  {ticketLinea3 && (
                    <p className="text-text-secondary">
                      {ticketLinea3.toUpperCase()}
                    </p>
                  )}
                  <p className="text-text-tertiary pt-1">
                    ════════════════════════════
                  </p>
                  <p className="text-text-tertiary text-xs">
                    DATOS DE VOTACIÓN
                  </p>
                  <p className="text-text-tertiary text-xs">...</p>
                </div>
              </div>
            )}
          </div>

          {esRoot && (
            <button
              onClick={handleGuardarTicketHeader}
              disabled={actualizarCampanaMutation.isPending}
              className="w-full mt-4 btn btn-primary flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              {actualizarCampanaMutation.isPending
                ? "Guardando..."
                : "Guardar header del ticket"}
            </button>
          )}
        </div>

        {/* ==========================================
            TRANSPORTE
        ========================================== */}
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

        {/* ==========================================
            SISTEMA DE TICKETS (DIA D)
        ========================================== */}
        <div>
          <h2 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Sistema de Tickets (Día D)
          </h2>
          <div className="space-y-4">
            <div
              className={`bg-bg-content border rounded-xl p-5 ${!esRoot ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Activador de Tickets
                    </p>
                    <p className="text-sm text-text-tertiary mt-1">
                      Permite que los activadores validen físicamente los
                      tickets impresos ingresando el PIN antes de que el votante
                      pueda usarlo.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!esRoot}
                  onClick={() => setUsarActivadorTicket(!usarActivadorTicket)}
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                    usarActivadorTicket ? "bg-primary" : "bg-text-tertiary/30"
                  } disabled:cursor-not-allowed`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      usarActivadorTicket ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div
                className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                  usarActivadorTicket
                    ? "bg-primary/10 text-primary"
                    : "bg-text-tertiary/10 text-text-tertiary"
                }`}
              >
                {usarActivadorTicket
                  ? "Los tickets requieren activación manual"
                  : "Los tickets impresos están listos para usar"}
              </div>
            </div>

            <div
              className={`bg-bg-content border rounded-xl p-5 ${!esRoot ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center shrink-0">
                    <Users size={18} className="text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Verificador de Asistencia
                    </p>
                    <p className="text-sm text-text-tertiary mt-1">
                      Permite confirmar que el votante llegó al local de
                      votación antes de registrar su voto.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!esRoot}
                  onClick={() =>
                    setUsarVerificadorAsistencia(!usarVerificadorAsistencia)
                  }
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                    usarVerificadorAsistencia
                      ? "bg-success"
                      : "bg-text-tertiary/30"
                  } disabled:cursor-not-allowed`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      usarVerificadorAsistencia
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div
                className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                  usarVerificadorAsistencia
                    ? "bg-success/10 text-success"
                    : "bg-text-tertiary/10 text-text-tertiary"
                }`}
              >
                {usarVerificadorAsistencia
                  ? "Se verificará la asistencia al local antes del voto"
                  : "No se requiere verificación de asistencia"}
              </div>
            </div>

            <div
              className={`bg-bg-content border rounded-xl p-5 ${!esRoot ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center shrink-0">
                    <AlertCircle size={18} className="text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Registro de Solidaridad
                    </p>
                    <p className="text-sm text-text-tertiary mt-1">
                      Permite registrar aportes económicos de los simpatizantes
                      el día de la elección.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!esRoot}
                  onClick={() => setUsarSolidaridad(!usarSolidaridad)}
                  className={`relative shrink-0 w-12 h-6 rounded-full transition-colors ${
                    usarSolidaridad ? "bg-warning" : "bg-text-tertiary/30"
                  } disabled:cursor-not-allowed`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      usarSolidaridad ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div
                className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                  usarSolidaridad
                    ? "bg-warning/10 text-warning"
                    : "bg-text-tertiary/10 text-text-tertiary"
                }`}
              >
                {usarSolidaridad
                  ? "Se registrarán aportes de solidaridad"
                  : "No se registra solidaridad económica"}
              </div>
            </div>

            {(usarActivadorTicket ||
              usarVerificadorAsistencia ||
              usarSolidaridad) && (
              <div
                className={`bg-bg-content border rounded-xl p-5 ${!esRoot ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3 pb-4 border-b border-border">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Settings size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      Método de Verificación
                    </p>
                    <p className="text-sm text-text-tertiary mt-1">
                      Selecciona cómo se verificarán los tickets: ingreso manual
                      del PIN o lectura automática de código QR.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="PIN"
                      checked={metodoVerificacion === "PIN"}
                      onChange={(e) =>
                        setMetodoVerificacion(e.target.value as "PIN" | "QR")
                      }
                      disabled={!esRoot}
                      className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium text-text-primary">
                        PIN Manual
                      </p>
                      <p className="text-sm text-text-tertiary">
                        El operador ingresa manualmente el código de 6
                        caracteres
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="QR"
                      checked={metodoVerificacion === "QR"}
                      onChange={(e) =>
                        setMetodoVerificacion(e.target.value as "PIN" | "QR")
                      }
                      disabled={!esRoot}
                      className="w-4 h-4 text-primary border-border focus:ring-2 focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium text-text-primary">Código QR</p>
                      <p className="text-sm text-text-tertiary">
                        Lectura automática con cámara del dispositivo (más
                        rápido)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {esRoot && (
            <button
              onClick={handleGuardarTickets}
              disabled={actualizarCampanaMutation.isPending}
              className="w-full mt-4 btn btn-primary flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              {actualizarCampanaMutation.isPending
                ? "Guardando..."
                : "Guardar configuración de tickets"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionCampanaPage;
