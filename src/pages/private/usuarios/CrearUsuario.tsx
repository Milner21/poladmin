// src/pages/private/usuarios/CrearUsuario.tsx

import { PageHeader } from "@components";
import { usePermisos } from "@hooks/usePermisos";
import { useCampanaSeleccionada } from "@hooks/useCampanaSeleccionada";
import RoutesConfig from "@routes/RoutesConfig";
import { useMemo, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { usePerfiles } from "../perfiles/hooks/usePerfiles";
import { usePermisos as useListaPermisos } from "../permisos/hooks/usePermisos";
import { UsuarioForm } from "./components/UsuarioForm";
import { useCrearUsuario } from "./hooks/useCrearUsuario";
import { useCandidatosSuperiores } from "./hooks/useCandidatosSuperiores";
import toast from "react-hot-toast";
import { useBuscarPadron } from "../simpatizantes/hooks/useBuscarPadron";
import { BusquedaCIPadron } from "./crear/components/BusquedaCIPadron";
import { usuariosService } from "@services/usuarios.service";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

interface FormValues {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  barrio: string;
  password: string;
  confirmarPassword: string;
  perfil_id: string;
  campana_id: string;
  candidato_superior_id: string;
  username: string;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  documento?: string;
  password?: string;
  confirmarPassword?: string;
  perfil_id?: string;
  campana_id?: string;
  username?: string;
}

const initialValues: FormValues = {
  nombre: "",
  apellido: "",
  documento: "",
  telefono: "",
  barrio: "",
  password: "",
  confirmarPassword: "",
  perfil_id: "",
  campana_id: "",
  candidato_superior_id: "",
  username: "",
};

const CrearUsuario: FC = () => {
  const navigate = useNavigate();

  const [buscandoPadron, setBuscandoPadron] = useState(true);
  const [ciBusqueda, setCiBusqueda] = useState("");
  const [verificandoCi, setVerificandoCi] = useState(false);
  const [datosPadronEncontrados, setDatosPadronEncontrados] = useState<{
    nombre: string;
    apellido: string;
  } | null>(null);

  // Estados del formulario
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  // Estados para la logica Operativa
  const [tipoUsuario, setTipoUsuario] = useState<"politico" | "operativo">(
    "politico",
  );
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    [],
  );

  // Estados para activacion de usuario existente inactivo
  const [modalActivarOpen, setModalActivarOpen] = useState(false);
  const [usuarioInactivoId, setUsuarioInactivoId] = useState<string | null>(null);
  const [modoInactivo, setModoInactivo] = useState<string>("");
  const [activandoCargando, setActivandoCargando] = useState(false);

  // Hooks de datos
  const { buscar, buscando } = useBuscarPadron();
  const { esRoot, getNivelOrden, obtenerTodosLosPermisos } = usePermisos();
  const { data: perfiles } = usePerfiles();
  const { campanaSeleccionada } = useCampanaSeleccionada();
  const { data: todosLosPermisosDb } = useListaPermisos();

  const perfilSeleccionado = perfiles?.find((p) => p.id === values.perfil_id);
  const nivelOrdenSeleccionado = perfilSeleccionado?.nivel?.orden ?? 0;

  const { data: candidatosSuperiores, isLoading: isLoadingCandidatos } =
    useCandidatosSuperiores(campanaSeleccionada, nivelOrdenSeleccionado);

  const crearMutation = useCrearUsuario();

  const perfilesConDisponibilidad = useMemo(() => {
    if (!perfiles) return [];
    const nivelActual = getNivelOrden();
    const todosLosPermisos = obtenerTodosLosPermisos();

    const tienePermisoCrearPolitico = todosLosPermisos.includes(
      "crear_usuario_politico",
    );
    const tienePermisoCrearOperativo = todosLosPermisos.includes(
      "crear_usuario_operativo",
    );

    return perfiles.map((perfil) => {
      let disponible = false;
      let razon = "";

      if (tipoUsuario === "operativo") {
        if (!tienePermisoCrearOperativo) {
          razon = "No tenes permiso para crear usuarios operativos";
        } else if (!perfil.es_operativo) {
          razon = "Este perfil es politico, no operativo";
        } else {
          disponible = true;
        }
      }

      if (tipoUsuario === "politico") {
        if (perfil.es_operativo) {
          razon = "Este perfil es operativo, no politico";
        } else if (esRoot && perfil.nombre === "ROOT") {
          razon = "No se puede crear otro ROOT";
        } else if (!tienePermisoCrearPolitico) {
          razon = "No tenes permiso para crear usuarios politicos";
        } else if (!esRoot && perfil.nivel?.exclusivo_root) {
          razon = "Solo ROOT puede crear este nivel (facturable)";
        } else if (!perfil.nivel) {
          razon = "Perfil sin nivel asignado";
        } else {
          if (esRoot) {
            disponible = true;
          } else {
            const nivelReferencia = nivelActual;

            if (perfil.nivel.orden <= nivelReferencia) {
              razon = "Solo podes crear usuarios de nivel inferior";
            } else {
              disponible = true;
            }
          }
        }
      }

      return { ...perfil, disponible, razon };
    });
  }, [perfiles, tipoUsuario, esRoot, getNivelOrden, obtenerTodosLosPermisos]);

  const perfilesFiltrados = perfilesConDisponibilidad.filter(
    (p) => p.disponible,
  );

  const permisosParaAsignar = useMemo(() => {
    if (!todosLosPermisosDb) return [];

    if (esRoot) return todosLosPermisosDb;

    const misPermisosNombres = obtenerTodosLosPermisos();

    return todosLosPermisosDb.filter((p) =>
      misPermisosNombres.includes(p.nombre),
    );
  }, [todosLosPermisosDb, esRoot, obtenerTodosLosPermisos]);

  const handleBuscarPadron = async () => {
    const ciLimpia = ciBusqueda.trim();
    if (!ciLimpia) {
      toast.error("Ingresa una cedula para buscar");
      return;
    }

    setVerificandoCi(true);

    try {
      const verificacion = await usuariosService.verificarPorCi(ciLimpia);

      if (verificacion.existe) {
        if (verificacion.pertenece_otra_campana) {
          toast.error(
            "Ya existe un usuario con este documento registrado en otra campana",
          );
          setVerificandoCi(false);
          return;
        }

        if (verificacion.eliminado) {
          toast(
            "Este usuario fue eliminado anteriormente. Completa el formulario para reactivarlo.",
            { icon: "i" },
          );
          setValues((prev) => ({
            ...prev,
            documento: ciLimpia,
            nombre: verificacion.usuario?.nombre ?? "",
            apellido: verificacion.usuario?.apellido ?? "",
          }));
          setBuscandoPadron(false);
          setVerificandoCi(false);
          return;
        }

        if (verificacion.activo_en_modo_actual) {
          toast.error(
            "Ya existe un usuario activo con esta cedula en la campana actual",
          );
          setVerificandoCi(false);
          return;
        }

        // Usuario existente inactivo en este modo electoral -> Abrir modal
        if (verificacion.usuario) {
          setUsuarioInactivoId(verificacion.usuario.id);
          setModoInactivo(verificacion.modo_eleccion ?? "GENERALES");
          setValues((prev) => ({
            ...prev,
            documento: verificacion.usuario!.documento,
            nombre: verificacion.usuario!.nombre,
            apellido: verificacion.usuario!.apellido,
          }));
          setModalActivarOpen(true);
          setVerificandoCi(false);
          return;
        }
      }
    } catch {
      // Si falla la verificacion por red/error imprevisto, se intenta continuar con padron
    } finally {
      setVerificandoCi(false);
    }

    // Si no existe como usuario en la base de datos, buscar en padron electoral
    const resultado = await buscar(ciLimpia);

    if (!resultado) return;

    if (
      resultado.encontrado_en === "PADRON_INTERNO" ||
      resultado.encontrado_en === "PADRON_GENERAL"
    ) {
      setDatosPadronEncontrados({
        nombre: resultado.datos?.nombre ?? "",
        apellido: resultado.datos?.apellido ?? "",
      });
      setValues((prev) => ({
        ...prev,
        documento: ciLimpia,
        nombre: resultado.datos?.nombre ?? "",
        apellido: resultado.datos?.apellido ?? "",
      }));
      toast.success("Datos cargados desde el padron");
      setBuscandoPadron(false);
    } else {
      setValues((prev) => ({
        ...prev,
        documento: ciLimpia,
      }));
      toast("No encontrado en padron. Completa manualmente.", {
        icon: "i",
      });
      setBuscandoPadron(false);
    }
  };

  const handleOmitirBusqueda = () => {
    setBuscandoPadron(false);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!values.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!values.apellido.trim())
      newErrors.apellido = "El apellido es requerido";
    if (!values.documento.trim())
      newErrors.documento = "El documento es requerido";
    if (!values.perfil_id) newErrors.perfil_id = "El perfil es requerido";

    if (perfilSeleccionado?.username_manual && !values.username.trim()) {
      newErrors.username = "El usuario es requerido para este perfil";
    }

    if (!values.password) {
      newErrors.password = "La contrasena es requerida";
    } else if (values.password.length < 6) {
      newErrors.password = "La contrasena debe tener al menos 6 caracteres";
    }

    if (!values.confirmarPassword) {
      newErrors.confirmarPassword = "Confirma la contrasena";
    } else if (values.password !== values.confirmarPassword) {
      newErrors.confirmarPassword = "Las contrasenas no coinciden";
    }

    if (esRoot && tipoUsuario === "politico" && nivelOrdenSeleccionado > 1) {
      if (!values.candidato_superior_id) {
        newErrors.perfil_id = "Debes seleccionar el candidato superior";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (field === "perfil_id") {
      setValues((prev) => ({
        ...prev,
        candidato_superior_id: "",
        username: "",
      }));
    }
  };

  const handleTipoUsuarioChange = (tipo: "politico" | "operativo") => {
    setTipoUsuario(tipo);
    setValues((prev) => ({ ...prev, perfil_id: "" }));
    setPermisosSeleccionados([]);
  };

  const handleTogglePermiso = (permisoId: string) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId],
    );
  };

  const handleConfirmarActivacion = async () => {
    if (!usuarioInactivoId) return;
    setActivandoCargando(true);
    try {
      await usuariosService.activarParaModo(usuarioInactivoId, true);
      toast.success("Usuario activado correctamente. Completa sus datos.");
      navigate(`${RoutesConfig.usuarios}/editar/${usuarioInactivoId}`);
    } catch {
      toast.error("Error al activar el usuario");
    } finally {
      setActivandoCargando(false);
      setModalActivarOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    crearMutation.mutate(
      {
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        documento: values.documento.trim(),
        password: values.password,
        perfil_id: values.perfil_id,
        telefono: values.telefono.trim() || undefined,
        barrio: values.barrio.trim() || undefined,
        campana_id: esRoot ? campanaSeleccionada : undefined,
        permisos_ids:
          tipoUsuario === "operativo" ? permisosSeleccionados : undefined,
        candidato_superior_id:
          esRoot && tipoUsuario === "politico" && nivelOrdenSeleccionado > 1
            ? values.candidato_superior_id
            : undefined,
        username:
          perfilSeleccionado?.username_manual && values.username.trim()
            ? values.username.trim()
            : undefined,
      },
      {
        onSuccess: () => navigate(RoutesConfig.usuarios),
      },
    );
  };

  return (
    <div className="py-4 px-6">
      <PageHeader
        title="Nuevo Usuario"
        subtitle="Completa los datos del nuevo usuario para tu red"
        showDivider
      />

      <div className="max-w-3xl">
        {buscandoPadron ? (
          <>
            <BusquedaCIPadron
              value={ciBusqueda}
              onChange={setCiBusqueda}
              onBuscar={handleBuscarPadron}
              isLoading={buscando || verificandoCi}
            />

            <div className="text-center">
              <button
                type="button"
                onClick={handleOmitirBusqueda}
                className="text-sm text-text-tertiary hover:text-text-primary underline"
              >
                Omitir busqueda y llenar manualmente
              </button>
            </div>
          </>
        ) : (
          <div className="bg-bg-content border border-border rounded-xl p-6 shadow-sm">
            {datosPadronEncontrados && (
              <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg">
                <p className="text-sm text-success font-medium">
                  Datos cargados desde el padron
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  {datosPadronEncontrados.nombre}{" "}
                  {datosPadronEncontrados.apellido} — CI: {values.documento}
                </p>
              </div>
            )}

            {esRoot &&
              tipoUsuario === "politico" &&
              nivelOrdenSeleccionado > 1 && (
                <div className="mb-6 p-4 bg-warning/5 border border-warning/30 rounded-lg">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Candidato Superior <span className="text-danger">*</span>
                  </label>
                  <p className="text-xs text-text-tertiary mb-3">
                    Selecciona quien sera el jefe directo de este{" "}
                    {perfilSeleccionado?.nivel?.nombre || "usuario"}
                  </p>

                  {isLoadingCandidatos ? (
                    <div className="flex items-center gap-2 text-text-tertiary">
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Cargando candidatos...
                    </div>
                  ) : candidatosSuperiores &&
                    candidatosSuperiores.length > 0 ? (
                    <select
                      value={values.candidato_superior_id}
                      onChange={(e) =>
                        handleChange("candidato_superior_id", e.target.value)
                      }
                      className={`
          w-full px-4 py-2 rounded-lg border bg-bg-content
          text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all
          ${errors.perfil_id && !values.candidato_superior_id ? "border-danger ring-2 ring-danger/20" : "border-border"}
        `}
                    >
                      <option value="">
                        Seleccionar candidato superior...
                      </option>
                      {candidatosSuperiores.map((candidato) => (
                        <option key={candidato.id} value={candidato.id}>
                          {candidato.nombre} {candidato.apellido} —{" "}
                          {candidato.nivel.nombre}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div>
                            <p className="text-danger font-semibold text-sm mb-1">
                              No hay candidatos superiores disponibles
                            </p>
                            <p className="text-text-secondary text-xs">
                              Para crear un{" "}
                              <strong>
                                {perfilSeleccionado?.nivel?.nombre}
                              </strong>
                              , primero necesitas crear un usuario de nivel
                              superior en esta campana.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-info/10 border border-info/30 rounded-lg">
                        <p className="text-xs text-text-primary">
                          Sugerencia: Crea primero un{" "}
                          {nivelOrdenSeleccionado === 2
                            ? "Intendente"
                            : nivelOrdenSeleccionado === 3
                              ? "Intendente o Concejal"
                              : "usuario de nivel superior"}{" "}
                          para esta campana.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleChange("perfil_id", "");
                        }}
                        className="w-full px-4 py-2 bg-bg-base border border-border rounded-lg text-text-primary hover:bg-bg-hover transition-colors text-sm"
                      >
                        Elegir otro perfil
                      </button>
                    </div>
                  )}

                  {errors.perfil_id &&
                    !values.candidato_superior_id &&
                    candidatosSuperiores &&
                    candidatosSuperiores.length > 0 && (
                      <p className="text-danger text-xs mt-2">
                        {errors.perfil_id}
                      </p>
                    )}
                </div>
              )}

            <UsuarioForm
              values={values}
              errors={errors}
              isPending={crearMutation.isPending}
              isEditing={false}
              perfiles={perfilesFiltrados}
              perfilesConInfo={perfilesConDisponibilidad}
              tipoUsuario={tipoUsuario}
              onChangeTipoUsuario={handleTipoUsuarioChange}
              permisosDisponibles={permisosParaAsignar}
              permisosSeleccionados={permisosSeleccionados}
              onTogglePermiso={handleTogglePermiso}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={() => navigate(RoutesConfig.usuarios)}
            />
          </div>
        )}
      </div>

      {/* Modal de Activacion de Usuario Existente Inactivo */}
      {modalActivarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-content border border-border rounded-xl shadow-xl w-full max-w-md z-50 p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Usuario existente inactivo
              </h3>
              <p className="text-sm text-text-secondary">
                Esta persona ya tiene un usuario en el sistema pero no esta activa en la etapa actual de la campana (<strong>{modoInactivo}</strong>).
              </p>
              <p className="text-sm text-text-secondary mt-2">
                Deseas activarla ahora y pasar a completar sus datos (barrio, telefono, etc.)?
              </p>
            </div>

            <div className="bg-bg-base border border-border rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Nombre</span>
                <span className="text-text-primary font-medium">
                  {values.nombre} {values.apellido}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">CI</span>
                <span className="text-text-primary font-medium">{values.documento}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmarActivacion}
                disabled={activandoCargando}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {activandoCargando ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Si, activar y editar
              </button>
              <button
                type="button"
                onClick={() => setModalActivarOpen(false)}
                disabled={activandoCargando}
                className="flex-1 px-4 py-3 border border-border text-text-primary rounded-lg hover:bg-bg-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CrearUsuario;