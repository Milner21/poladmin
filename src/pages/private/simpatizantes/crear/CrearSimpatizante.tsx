import { PageHeader } from "@components";
import type {
  DatosBusquedaInteligente,
  ResultadoBusquedaInteligente,
} from "@dto/padron.types";
import type {
  CreateSimpatizanteDto,
  Simpatizante,
} from "@dto/simpatizante.types";
import type { PrioridadSolicitud } from "@dto/solicitud.types";
import { useAuth } from "@hooks/useAuth";
import { usePermisos } from "@hooks/usePermisos";
import { RotateCcw, Save } from "lucide-react";
import { useState, useRef, type FC } from "react";
import toast from "react-hot-toast";
import { useCrearSolicitud } from "../../solicitudes/hooks/useCrearSolicitud";
import { useBuscarPadron } from "../hooks/useBuscarPadron";
import { useCrearSimpatizante } from "../hooks/useCrearSimpatizante";
import type { ErrorDuplicadoPayload } from "../hooks/useCrearSimpatizante";
import {
  BusquedaCI,
  BusquedaEnProgreso,
  DatosPadron,
  FormularioSimpatizante,
  ModalConfirmarPadron,
  ModalErrorSolicitud,
  ModalNoEncontrado,
  ModalSimpatizanteExistente,
  SeccionSolicitud,
} from "./components";
import { simpatizantesService } from "@services/simpatizantes.service";
import type { RespuestaDuplicadoRegistrado } from "@services/simpatizantes.service";
import { AxiosError } from "axios";

interface FormData {
  telefono: string;
  barrio: string;
  necesita_transporte: boolean;
  observaciones: string;
  latitud: number | null;
  longitud: number | null;
}

interface FormDataManual extends FormData {
  nombre: string;
  apellido: string;
}

interface SolicitudFormData {
  titulo: string;
  descripcion: string;
  prioridad: PrioridadSolicitud;
}

type ModalActivo =
  | {
      tipo: "CONFIRMAR_PADRON";
      datos: DatosBusquedaInteligente;
      resultado: ResultadoBusquedaInteligente;
    }
  | { tipo: "NO_ENCONTRADO"; resultado: ResultadoBusquedaInteligente }
  | {
      tipo: "SIMPATIZANTE_EXISTENTE";
      datos: DatosBusquedaInteligente;
      resultado: ResultadoBusquedaInteligente;
    }
  | null;

const formDataInicial: FormData = {
  telefono: "",
  barrio: "",
  necesita_transporte: false,
  observaciones: "",
  latitud: null,
  longitud: null,
};

const formDataManualInicial: FormDataManual = {
  nombre: "",
  apellido: "",
  telefono: "",
  barrio: "",
  necesita_transporte: false,
  observaciones: "",
  latitud: null,
  longitud: null,
};

const solicitudInicial: SolicitudFormData = {
  titulo: "",
  descripcion: "",
  prioridad: "MEDIA",
};

const datosVacios: DatosBusquedaInteligente = {
  ci: "",
  nombre: "",
  apellido: "",
  fecha_nacimiento: null,
  departamento: null,
  distrito: null,
  seccional: null,
  local_votacion: null,
  mesa: null,
  orden: null,
};

interface CrearSimpatizanteProps {
  embebido?: boolean;
  candidatoId?: string;
}

const CrearSimpatizante: FC<CrearSimpatizanteProps> = ({
  embebido = false,
  candidatoId,
}) => {
  const { usuario } = useAuth();

  const [ciBusqueda, setCiBusqueda] = useState("");
  const [datosConfirmados, setDatosConfirmados] =
    useState<ResultadoBusquedaInteligente | null>(null);
  const [modoManual, setModoManual] = useState(false);
  const [modalActivo, setModalActivo] = useState<ModalActivo>(null);
  const [formData, setFormData] = useState<FormData>(formDataInicial);
  const [formDataManual, setFormDataManual] = useState<FormDataManual>(
    formDataManualInicial,
  );
  const [tieneSolicitud, setTieneSolicitud] = useState(false);
  const [solicitudData, setSolicitudData] =
    useState<SolicitudFormData>(solicitudInicial);
  const [simpatizanteCreado, setSimpatizanteCreado] =
    useState<Simpatizante | null>(null);
  const [modalErrorOpen, setModalErrorOpen] = useState(false);
  const [isPendingDuplicado, setIsPendingDuplicado] = useState(false);

  const payloadPendienteRef = useRef<CreateSimpatizanteDto | null>(null);

  const { buscar, buscando, pasos, resetear } = useBuscarPadron();
  const crearMutation = useCrearSimpatizante();
  const crearSolicitudMutation = useCrearSolicitud();
  const { tienePermiso } = usePermisos();

  const tienePermisoSolicitud = tienePermiso("crear_solicitud");

  const handleLimpiar = () => {
    console.log("handleLimpiar llamado desde:", new Error().stack);
    setCiBusqueda("");
    setDatosConfirmados(null);
    setModoManual(false);
    setModalActivo(null);
    setFormData(formDataInicial);
    setFormDataManual(formDataManualInicial);
    setTieneSolicitud(false);
    setSolicitudData(solicitudInicial);
    setSimpatizanteCreado(null);
    setModalErrorOpen(false);
    payloadPendienteRef.current = null;
    resetear();
  };

  const handleBuscar = async () => {
    if (!ciBusqueda.trim()) {
      toast.error("Ingresá una cédula para buscar");
      return;
    }

    const resultado = await buscar(ciBusqueda.trim());
    if (!resultado) return;

    if (resultado.encontrado_en === "SIMPATIZANTE") {
      setModalActivo({
        tipo: "SIMPATIZANTE_EXISTENTE",
        datos: resultado.datos!,
        resultado,
      });
      return;
    }

    if (resultado.encontrado_en === "NO_ENCONTRADO") {
      setModalActivo({ tipo: "NO_ENCONTRADO", resultado });
      return;
    }

    setModalActivo({
      tipo: "CONFIRMAR_PADRON",
      datos: resultado.datos!,
      resultado,
    });
  };

  const handleConfirmarPadron = () => {
    if (!modalActivo || modalActivo.tipo !== "CONFIRMAR_PADRON") return;
    setDatosConfirmados(modalActivo.resultado);
    setModalActivo(null);
  };

  const handleCancelarModal = () => {
    setModalActivo(null);
    setCiBusqueda("");
    resetear();
  };

  const handleActivarModoManual = () => {
    setModalActivo(null);
    setModoManual(true);
    setFormDataManual(formDataManualInicial);
  };

  const handleFormChange = (
    field: keyof FormData,
    value: string | boolean | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormManualChange = (
    field: keyof FormDataManual,
    value: string | boolean | number | null,
  ) => {
    setFormDataManual((prev) => ({ ...prev, [field]: value }));
  };

  const handleSolicitudChange = (
    field: keyof SolicitudFormData,
    value: string,
  ) => {
    setSolicitudData((prev) => ({ ...prev, [field]: value }));
  };

  const registrarSolicitud = (simpatizante: Simpatizante) => {
    const asignadoAId = usuario?.candidato_superior_id ?? undefined;

    crearSolicitudMutation.mutate(
      {
        simpatizante_id: simpatizante.id,
        titulo: solicitudData.titulo,
        descripcion: solicitudData.descripcion,
        prioridad: solicitudData.prioridad,
        asignado_a_id: asignadoAId,
      },
      {
        onSuccess: () => {
          toast.success("Simpatizante y solicitud registrados correctamente");
          handleLimpiar();
        },
        onError: () => {
          setSimpatizanteCreado(simpatizante);
          setModalErrorOpen(true);
        },
      },
    );
  };

  const construirPayload = (): CreateSimpatizanteDto | null => {
    if (modoManual) {
      if (!formDataManual.nombre.trim() || !formDataManual.apellido.trim()) {
        toast.error(
          "El nombre y apellido son obligatorios para registro manual",
        );
        return null;
      }

      return {
        nombre: formDataManual.nombre,
        apellido: formDataManual.apellido,
        documento: ciBusqueda.trim(),
        telefono: formDataManual.telefono || undefined,
        barrio: formDataManual.barrio || undefined,
        necesita_transporte: formDataManual.necesita_transporte,
        observaciones: formDataManual.observaciones || undefined,
        latitud: formDataManual.latitud || undefined,
        longitud: formDataManual.longitud || undefined,
        origen_registro: "MANUAL",
        candidato_id: candidatoId || undefined,
      };
    }

    if (!datosConfirmados?.datos) return null;

    const datos = datosConfirmados.datos;
    const esInterno = datosConfirmados.encontrado_en === "PADRON_INTERNO";

    return {
      nombre: datos.nombre,
      apellido: datos.apellido,
      documento: datos.ci,
      telefono: formData.telefono || undefined,
      fecha_nacimiento: datos.fecha_nacimiento || undefined,
      departamento: datos.departamento || undefined,
      distrito: datos.distrito || undefined,
      barrio: formData.barrio || undefined,
      es_afiliado: esInterno,
      observaciones: formData.observaciones || undefined,
      necesita_transporte: formData.necesita_transporte,
      latitud: formData.latitud || undefined,
      longitud: formData.longitud || undefined,
      origen_registro: esInterno ? "PADRON_INTERNO" : "PADRON_GENERAL",
      candidato_id: candidatoId || undefined,
      ...(esInterno
        ? {
            seccional_interna: datos.seccional || undefined,
            local_votacion_interna: datos.local_votacion || undefined,
            mesa_votacion_interna: datos.mesa || undefined,
            orden_votacion_interna: datos.orden || undefined,
          }
        : {
            local_votacion_general: datos.local_votacion || undefined,
            mesa_votacion_general: datos.mesa || undefined,
            orden_votacion_general: datos.orden || undefined,
          }),
    };
  };

  const handleGuardar = () => {
    if (!datosConfirmados && !modoManual) {
      toast.error("Primero buscá una cédula en el padrón");
      return;
    }

    if (tieneSolicitud) {
      if (!solicitudData.titulo.trim()) {
        toast.error('Completá el campo "Solicita" para registrar la solicitud');
        return;
      }
      if (!solicitudData.descripcion.trim()) {
        toast.error("Completá el detalle de la solicitud");
        return;
      }
    }

    const payload = construirPayload();
    if (!payload) return;

    payloadPendienteRef.current = payload;
    console.log("ref asignado:", payloadPendienteRef.current);

    crearMutation.mutate(payload, {
      onSuccess: (respuesta) => {
        const esDuplicadoRegistrado = (
          r: typeof respuesta,
        ): r is RespuestaDuplicadoRegistrado =>
          typeof r === "object" &&
          r !== null &&
          "duplicado_registrado" in r &&
          (r as RespuestaDuplicadoRegistrado).duplicado_registrado === true;

        if (esDuplicadoRegistrado(respuesta)) {
          toast.success(respuesta.mensaje);
          handleLimpiar();
          return;
        }

        const simpatizante = respuesta as Simpatizante;

        if (tieneSolicitud && tienePermisoSolicitud) {
          registrarSolicitud(simpatizante);
        } else {
          toast.success("Simpatizante registrado exitosamente");
          handleLimpiar();
        }
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          const responseMessage = error.response?.data?.message;

          if (typeof responseMessage === "object" && responseMessage !== null) {
            const duplicadoPayload = responseMessage as ErrorDuplicadoPayload;

            if (
              duplicadoPayload.codigo === "SIMPATIZANTE_DUPLICADO_CONFIRMABLE"
            ) {
              const datos = datosConfirmados?.datos ?? null;
              if (datos) {
                setModalActivo({
                  tipo: "SIMPATIZANTE_EXISTENTE",
                  datos,
                  resultado: datosConfirmados!,
                });
              }
              return;
            }

            if (
              duplicadoPayload.codigo === "SIMPATIZANTE_DUPLICADO_NO_PERMITIDO"
            ) {
              toast.error(duplicadoPayload.mensaje);
              return;
            }
          }

          const mensaje =
            typeof error.response?.data?.message === "string"
              ? error.response.data.message
              : "Error al registrar simpatizante";

          toast.error(mensaje);
        }
      },
    });
  };

  const handleConfirmarDuplicado = async () => {
    if (modalActivo?.tipo !== "SIMPATIZANTE_EXISTENTE") {
      toast.error("No hay datos para confirmar");
      return;
    }

    const simpatizanteId = modalActivo.resultado.simpatizante_id;

    if (!simpatizanteId) {
      toast.error("No se encontró el ID del simpatizante");
      return;
    }

    setIsPendingDuplicado(true);

    try {
      const respuesta = await simpatizantesService.crear({
        nombre: modalActivo.datos.nombre,
        apellido: modalActivo.datos.apellido,
        documento: modalActivo.datos.ci,
        confirmar_duplicado: true,
      });

      const esDuplicadoRegistrado = (
        r: typeof respuesta,
      ): r is RespuestaDuplicadoRegistrado =>
        typeof r === "object" &&
        r !== null &&
        "duplicado_registrado" in r &&
        (r as RespuestaDuplicadoRegistrado).duplicado_registrado === true;

      if (esDuplicadoRegistrado(respuesta)) {
        toast.success(respuesta.mensaje);
        handleLimpiar();
      }
    } catch {
      toast.error("Error al registrar el intento duplicado");
    } finally {
      setIsPendingDuplicado(false);
    }
  };

  const mostrarFormulario =
    (datosConfirmados !== null && !modoManual) || modoManual;
  const isPending = crearMutation.isPending || crearSolicitudMutation.isPending;
  const mostrarBusqueda =
    !buscando && pasos.length === 0 && !datosConfirmados && !modoManual;

  const datosPadronParaMostrar = datosConfirmados?.datos
    ? {
        ci: datosConfirmados.datos.ci,
        nombre: datosConfirmados.datos.nombre,
        apellido: datosConfirmados.datos.apellido,
        fecha_nacimiento: datosConfirmados.datos.fecha_nacimiento,
        departamento: datosConfirmados.datos.departamento,
        distrito: datosConfirmados.datos.distrito,
        seccional: datosConfirmados.datos.seccional,
        local_votacion: datosConfirmados.datos.local_votacion,
        mesa_votacion: datosConfirmados.datos.mesa,
        orden_votacion: datosConfirmados.datos.orden,
        es_afiliado: datosConfirmados.encontrado_en === "PADRON_INTERNO",
      }
    : null;

  return (
    <div className={embebido ? "" : "bg-bg-base"}>
      {!embebido && (
        <div className="sticky top-0 z-10 bg-bg-content border-b border-border px-4 py-3 md:relative md:bg-transparent md:border-0 md:px-6 md:py-4">
          <PageHeader
            title="Registrar Simpatizante"
            subtitle="Busca por cedula y completa los datos"
            showDivider={false}
          />
        </div>
      )}

       <div className={embebido ? "space-y-4" : "px-4 pb-6 md:px-6 max-w-2xl mx-auto"}>
        {mostrarBusqueda && (
          <BusquedaCI
            value={ciBusqueda}
            onChange={setCiBusqueda}
            onBuscar={handleBuscar}
            isLoading={buscando}
          />
        )}

        {(buscando || pasos.length > 0) && !datosConfirmados && !modoManual && (
          <BusquedaEnProgreso pasos={pasos} buscando={buscando} />
        )}

        {datosConfirmados && !modoManual && datosPadronParaMostrar && (
          <DatosPadron datos={datosPadronParaMostrar} />
        )}

        {modoManual && (
          <>
            <div className="bg-warning/10 border-2 border-warning/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-text-primary">
                <strong>Registro Manual</strong> — Esta persona no figura en el
                padron. Completa los datos manualmente.
              </p>
            </div>

            <div className="bg-bg-content rounded-xl p-4 shadow-sm mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={formDataManual.nombre}
                    onChange={(e) =>
                      handleFormManualChange("nombre", e.target.value)
                    }
                    placeholder="Nombre completo"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Apellido <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={formDataManual.apellido}
                    onChange={(e) =>
                      handleFormManualChange("apellido", e.target.value)
                    }
                    placeholder="Apellido completo"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-bg-base"
                  />
                </div>
              </div>
            </div>

            <FormularioSimpatizante
              formData={formDataManual}
              onChange={handleFormManualChange}
              departamento=""
              ciudad=""
            />
          </>
        )}

        {mostrarFormulario && !modoManual && (
          <FormularioSimpatizante
            formData={formData}
            onChange={handleFormChange}
            departamento={datosConfirmados?.datos?.departamento ?? ""}
            ciudad={datosConfirmados?.datos?.distrito ?? ""}
          />
        )}

        {mostrarFormulario && tienePermisoSolicitud && !embebido && (
          <div className="mt-4">
            <SeccionSolicitud
              activa={tieneSolicitud}
              onToggle={setTieneSolicitud}
              data={solicitudData}
              onChange={handleSolicitudChange}
            />
          </div>
        )}

        {mostrarFormulario && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleGuardar}
              disabled={isPending}
              className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-lg"
            >
              <Save className="w-5 h-5" />
              {crearMutation.isPending
                ? "Guardando simpatizante..."
                : crearSolicitudMutation.isPending
                  ? "Guardando solicitud..."
                  : "Guardar"}
            </button>

            <button
              onClick={handleLimpiar}
              disabled={isPending}
              title="Nueva busqueda"
              className="px-6 py-4 border border-border text-text-primary rounded-xl hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="hidden md:inline text-sm">Nueva busqueda</span>
            </button>
          </div>
        )}
      </div>

      <ModalConfirmarPadron
        isOpen={modalActivo?.tipo === "CONFIRMAR_PADRON"}
        encontradoEn={
          modalActivo?.tipo === "CONFIRMAR_PADRON"
            ? modalActivo.resultado.encontrado_en
            : "PADRON_INTERNO"
        }
        datos={
          modalActivo?.tipo === "CONFIRMAR_PADRON"
            ? modalActivo.datos
            : datosVacios
        }
        onConfirmar={handleConfirmarPadron}
        onCancelar={handleCancelarModal}
      />

      <ModalNoEncontrado
        isOpen={modalActivo?.tipo === "NO_ENCONTRADO"}
        cedula={ciBusqueda}
        permiteRegistroManual={
          modalActivo?.tipo === "NO_ENCONTRADO"
            ? modalActivo.resultado.permite_registro_manual
            : false
        }
        onRegistrarManual={handleActivarModoManual}
        onCancelar={handleCancelarModal}
      />

      <ModalSimpatizanteExistente
        isOpen={modalActivo?.tipo === "SIMPATIZANTE_EXISTENTE"}
        datos={
          modalActivo?.tipo === "SIMPATIZANTE_EXISTENTE"
            ? modalActivo.datos
            : datosVacios
        }
        permiteDuplicados={
          modalActivo?.tipo === "SIMPATIZANTE_EXISTENTE"
            ? modalActivo.resultado.permite_duplicados_simpatizantes
            : false
        }
        isPending={isPendingDuplicado}
        onConfirmarDuplicado={handleConfirmarDuplicado}
        onCancelar={handleCancelarModal}
      />

      <ModalErrorSolicitud
        isOpen={modalErrorOpen}
        isPending={crearSolicitudMutation.isPending}
        onReintentar={() => {
          if (simpatizanteCreado) registrarSolicitud(simpatizanteCreado);
        }}
        onOmitir={() => {
          toast("Simpatizante guardado. La solicitud fue omitida.", {
            icon: "⚠️",
          });
          handleLimpiar();
        }}
      />
    </div>
  );
};

export default CrearSimpatizante;
