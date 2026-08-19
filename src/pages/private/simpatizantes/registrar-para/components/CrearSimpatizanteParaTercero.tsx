// src/pages/private/simpatizantes/registrar-para/components/CrearSimpatizanteParaTercero.tsx

import type {
  DatosBusquedaInteligente,
  ResultadoBusquedaInteligente,
} from "@dto/padron.types";
import type { CreateSimpatizanteDto } from "@dto/simpatizante.types";
import { RotateCcw, Save, UserPlus } from "lucide-react";
import { useState, useRef, type FC } from "react";
import toast from "react-hot-toast";
import { useBuscarPadron } from "../../hooks/useBuscarPadron";
import { useCrearSimpatizanteParaTercero } from "../../hooks/useCrearSimpatizanteParaTercero";
import type { ErrorDuplicadoPayload } from "../../hooks/useCrearSimpatizante";
import {
  BusquedaCI,
  BusquedaEnProgreso,
  DatosPadron,
  FormularioSimpatizante,
  ModalConfirmarPadron,
  ModalNoEncontrado,
  ModalSimpatizanteExistente,
} from "../../crear/components";
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

const datosVacios: DatosBusquedaInteligente = {
  ci: "",
  nombre: "",
  apellido: "",
  fecha_nacimiento: null,
  departamento: null,
  distrito: null,
  padron_interno: null,
  padron_general: null,
};

interface CrearSimpatizanteParaTerceroProps {
  usuarioDestinoId: string;
  usuarioDestinoNombre: string;
}

const CrearSimpatizanteParaTercero: FC<CrearSimpatizanteParaTerceroProps> = ({
  usuarioDestinoId,
  usuarioDestinoNombre,
}) => {
  const [ciBusqueda, setCiBusqueda] = useState("");
  const [datosConfirmados, setDatosConfirmados] =
    useState<ResultadoBusquedaInteligente | null>(null);
  const [modoManual, setModoManual] = useState(false);
  const [modalActivo, setModalActivo] = useState<ModalActivo>(null);
  const [formData, setFormData] = useState<FormData>(formDataInicial);
  const [formDataManual, setFormDataManual] = useState<FormDataManual>(
    formDataManualInicial,
  );
  const [isPendingDuplicado, setIsPendingDuplicado] = useState(false);

  const payloadPendienteRef = useRef<CreateSimpatizanteDto | null>(null);

  const { buscar, buscando, pasos, resetear } = useBuscarPadron();
  const crearMutation = useCrearSimpatizanteParaTercero();

  const handleLimpiar = () => {
    setCiBusqueda("");
    setDatosConfirmados(null);
    setModoManual(false);
    setModalActivo(null);
    setFormData(formDataInicial);
    setFormDataManual(formDataManualInicial);
    payloadPendienteRef.current = null;
    resetear();
  };

  const handleBuscar = async () => {
    if (!ciBusqueda.trim()) {
      toast.error("Ingresa una cedula para buscar");
      return;
    }

    const resultado = await buscar(ciBusqueda.trim());
    if (!resultado) return;

    // Simpatizante existente con ficha en el modo activo: bloquear como duplicado
    if (
      resultado.encontrado_en === "SIMPATIZANTE" &&
      !resultado.simpatizante_base_existente
    ) {
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

    // Persona en padron o simpatizante base existente sin ficha en modo activo:
    // mostrar modal de confirmacion y continuar al formulario
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
      };
    }

    if (!datosConfirmados?.datos) return null;

    const datos = datosConfirmados.datos;

    // Siempre enviar ambos bloques de datos de padron
    // El backend guarda lo que corresponda y deja vacio lo que no existe
    return {
      nombre: datos.nombre,
      apellido: datos.apellido,
      documento: datos.ci,
      telefono: formData.telefono || undefined,
      fecha_nacimiento: datos.fecha_nacimiento || undefined,
      departamento: datos.departamento || undefined,
      distrito: datos.distrito || undefined,
      barrio: formData.barrio || undefined,
      es_afiliado: datos.padron_interno !== null,
      observaciones: formData.observaciones || undefined,
      necesita_transporte: formData.necesita_transporte,
      latitud: formData.latitud || undefined,
      longitud: formData.longitud || undefined,
      origen_registro: datos.padron_interno
        ? "PADRON_INTERNO"
        : "PADRON_GENERAL",
      seccional_interna: datos.padron_interno?.seccional || undefined,
      local_votacion_interna: datos.padron_interno?.local_votacion || undefined,
      mesa_votacion_interna: datos.padron_interno?.mesa || undefined,
      orden_votacion_interna: datos.padron_interno?.orden || undefined,
      local_votacion_general: datos.padron_general?.local_votacion || undefined,
      mesa_votacion_general: datos.padron_general?.mesa || undefined,
      orden_votacion_general: datos.padron_general?.orden || undefined,
    };
  };

  const handleGuardar = () => {
    if (!datosConfirmados && !modoManual) {
      toast.error("Primero busca una cedula en el padron");
      return;
    }

    const payload = construirPayload();
    if (!payload) return;

    payloadPendienteRef.current = payload;

    crearMutation.mutate(
      {
        paraUsuarioId: usuarioDestinoId,
        datos: payload,
      },
      {
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

          toast.success(`Simpatizante registrado para ${usuarioDestinoNombre}`);
          handleLimpiar();
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            const responseMessage = error.response?.data?.message;

            if (
              typeof responseMessage === "object" &&
              responseMessage !== null
            ) {
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
                duplicadoPayload.codigo ===
                "SIMPATIZANTE_DUPLICADO_NO_PERMITIDO"
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
      },
    );
  };

  const handleConfirmarDuplicado = async () => {
    if (modalActivo?.tipo !== "SIMPATIZANTE_EXISTENTE") {
      toast.error("No hay datos para confirmar");
      return;
    }

    const simpatizanteId = modalActivo.resultado.simpatizante_id;

    if (!simpatizanteId) {
      toast.error("No se encontro el ID del simpatizante");
      return;
    }

    setIsPendingDuplicado(true);

    try {
      const respuesta = await simpatizantesService.crearParaTercero(
        usuarioDestinoId,
        {
          nombre: modalActivo.datos.nombre,
          apellido: modalActivo.datos.apellido,
          documento: modalActivo.datos.ci,
          confirmar_duplicado: true,
        },
      );

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
  const isPending = crearMutation.isPending;
  const mostrarBusqueda =
    !buscando && pasos.length === 0 && !datosConfirmados && !modoManual;

  // Modo activo resuelto desde el resultado de busqueda
  const modoEleccion: "INTERNAS" | "GENERALES" =
    datosConfirmados?.modo_eleccion ??
    modalActivo?.resultado?.modo_eleccion ??
    "INTERNAS";

  return (
    <div className="space-y-4">
      <div className="bg-success/10 border border-success/30 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-success">
          <UserPlus size={16} />
          <span>
            Registrando para: <strong>{usuarioDestinoNombre}</strong>
          </span>
        </div>
      </div>

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

      {datosConfirmados && !modoManual && datosConfirmados.datos && (
        <DatosPadron
          datos={datosConfirmados.datos}
          modoEleccion={modoEleccion}
        />
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

      {mostrarFormulario && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleGuardar}
            disabled={isPending}
            className="flex-1 px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-lg"
          >
            <Save className="w-5 h-5" />
            {crearMutation.isPending ? "Guardando..." : "Guardar"}
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

      <ModalConfirmarPadron
        isOpen={modalActivo?.tipo === "CONFIRMAR_PADRON"}
        encontradoEn={
          modalActivo?.tipo === "CONFIRMAR_PADRON"
            ? modalActivo.resultado.encontrado_en
            : "PADRON_INTERNO"
        }
        modoEleccion={
          modalActivo?.tipo === "CONFIRMAR_PADRON"
            ? modalActivo.resultado.modo_eleccion
            : "INTERNAS"
        }
        simpatizanteBaseExistente={
          modalActivo?.tipo === "CONFIRMAR_PADRON"
            ? modalActivo.resultado.simpatizante_base_existente
            : false
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
    </div>
  );
};

export default CrearSimpatizanteParaTercero;