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

interface FormValues {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
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
  const [datosPadronEncontrados, setDatosPadronEncontrados] = useState<{
    nombre: string;
    apellido: string;
  } | null>(null);

  const { buscar, buscando } = useBuscarPadron();

  // Estados del formulario
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  // Estados nuevos para la lógica Operativa
  const [tipoUsuario, setTipoUsuario] = useState<"politico" | "operativo">(
    "politico",
  );
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    [],
  );

  // Hooks de datos
  const { esRoot, esOperativo, getNivelOrden, obtenerTodosLosPermisos } =
    usePermisos();
  const { data: perfiles } = usePerfiles();
  const { campanaSeleccionada } = useCampanaSeleccionada();
  const { data: todosLosPermisosDb } = useListaPermisos();

  // Obtener el nivel del perfil seleccionado para saber si necesita candidato superior
  const perfilSeleccionado = perfiles?.find((p) => p.id === values.perfil_id);
  const nivelOrdenSeleccionado = perfilSeleccionado?.nivel?.orden ?? 0;

  // Hook para obtener candidatos superiores (solo si ROOT y nivel > 1)
  const { data: candidatosSuperiores, isLoading: isLoadingCandidatos } =
    useCandidatosSuperiores(campanaSeleccionada, nivelOrdenSeleccionado);

  const crearMutation = useCrearUsuario();

  // Filtrado mágico de perfiles dependiendo de lo que tocó el usuario (Politico u Operativo)
  // Filtrado mágico de perfiles con información de disponibilidad
  const perfilesConDisponibilidad = useMemo(() => {
    if (!perfiles) return [];
    const nivelActual = getNivelOrden();

    return perfiles.map((perfil) => {
      let disponible = false;
      let razon = "";

      // Si estamos en la tab "Operativo"
      if (tipoUsuario === "operativo") {
        if (esOperativo) {
          razon = "Los operativos no pueden crear otros operativos";
        } else if (nivelActual === 3) {
          razon = "Los líderes no pueden crear operativos";
        } else if (!perfil.es_operativo) {
          razon = "Este perfil es político, no operativo";
        } else {
          disponible = true;
        }
      }

      // Si estamos en la tab "Político"
      if (tipoUsuario === "politico") {
        if (perfil.es_operativo) {
          razon = "Este perfil es operativo, no político";
        } else if (esRoot && perfil.nombre === "ROOT") {
          razon = "No se puede crear otro ROOT";
        } else if (esOperativo) {
          razon = "Los operativos no pueden crear políticos";
        } else if (nivelActual === 3) {
          razon = "Los líderes no pueden crear otros usuarios";
        } else if (!esRoot && perfil.nivel?.exclusivo_root) {
          razon = "Solo ROOT puede crear este nivel (facturable)";
        } else if (!perfil.nivel) {
          razon = "Perfil sin nivel asignado";
        } else if (perfil.nivel.orden <= nivelActual) {
          razon = "Solo podés crear usuarios de nivel inferior";
        } else {
          disponible = true;
        }
      }

      return { ...perfil, disponible, razon };
    });
  }, [perfiles, tipoUsuario, esRoot, esOperativo, getNivelOrden]);

  const perfilesFiltrados = perfilesConDisponibilidad.filter(
    (p) => p.disponible,
  );

  // Filtrado mágico de permisos: Solo le mostramos los que él mismo tiene
  const permisosParaAsignar = useMemo(() => {
    if (!todosLosPermisosDb) return [];

    // Si es ROOT, puede asignar cualquier permiso de la base de datos
    if (esRoot) return todosLosPermisosDb;

    // Si no es ROOT, obtenemos el array de nombres de permisos que posee
    const misPermisosNombres = obtenerTodosLosPermisos();

    // Y filtramos los objetos Permiso que coincidan con esos nombres
    return todosLosPermisosDb.filter((p) =>
      misPermisosNombres.includes(p.nombre),
    );
  }, [todosLosPermisosDb, esRoot, obtenerTodosLosPermisos]);

  const handleBuscarPadron = async () => {
    if (!ciBusqueda.trim()) {
      toast.error("Ingresá una cédula para buscar");
      return;
    }

    const resultado = await buscar(ciBusqueda.trim());

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
        documento: ciBusqueda.trim(),
        nombre: resultado.datos?.nombre ?? "",
        apellido: resultado.datos?.apellido ?? "",
      }));
      toast.success("Datos cargados desde el padrón");
      setBuscandoPadron(false);
    } else {
      setValues((prev) => ({
        ...prev,
        documento: ciBusqueda.trim(),
      }));
      toast("No encontrado en padrón. Completá manualmente.", {
        icon: "ℹ️",
      });
      setBuscandoPadron(false);
    }
  };

  const handleOmitirBusqueda = () => {
    setBuscandoPadron(false);
  };

  // Validaciones
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
      newErrors.password = "La contraseña es requerida";
    } else if (values.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!values.confirmarPassword) {
      newErrors.confirmarPassword = "Confirmá la contraseña";
    } else if (values.password !== values.confirmarPassword) {
      newErrors.confirmarPassword = "Las contraseñas no coinciden";
    }

    if (esRoot && tipoUsuario === "politico" && nivelOrdenSeleccionado > 1) {
      if (!values.candidato_superior_id) {
        newErrors.perfil_id = "Debés seleccionar el candidato superior";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Si cambia el perfil, limpiar candidato superior porque la lista cambiará
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
    // Limpiamos el perfil elegido porque la lista cambió
    setValues((prev) => ({ ...prev, perfil_id: "" }));
    // Limpiamos permisos por si acaso
    setPermisosSeleccionados([]);
  };

  const handleTogglePermiso = (permisoId: string) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permisoId)
        ? prev.filter((id) => id !== permisoId)
        : [...prev, permisoId],
    );
  };

  // Submit final
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
        subtitle="Completá los datos del nuevo usuario para tu red"
        showDivider
      />

      <div className="max-w-3xl">
        {buscandoPadron ? (
          <>
            <BusquedaCIPadron
              value={ciBusqueda}
              onChange={setCiBusqueda}
              onBuscar={handleBuscarPadron}
              isLoading={buscando}
            />

            <div className="text-center">
              <button
                type="button"
                onClick={handleOmitirBusqueda}
                className="text-sm text-text-tertiary hover:text-text-primary underline"
              >
                Omitir búsqueda y llenar manualmente
              </button>
            </div>
          </>
        ) : (
          <div className="bg-bg-content border border-border rounded-xl p-6 shadow-sm">
            {datosPadronEncontrados && (
              <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg">
                <p className="text-sm text-success font-medium">
                  ✅ Datos cargados desde el padrón
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
                    👆 Candidato Superior <span className="text-danger">*</span>
                  </label>
                  <p className="text-xs text-text-tertiary mb-3">
                    Seleccioná quién será el jefe directo de este{" "}
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
                          <span className="text-2xl">⚠️</span>
                          <div>
                            <p className="text-danger font-semibold text-sm mb-1">
                              No hay candidatos superiores disponibles
                            </p>
                            <p className="text-text-secondary text-xs">
                              Para crear un{" "}
                              <strong>
                                {perfilSeleccionado?.nivel?.nombre}
                              </strong>
                              , primero necesitás crear un usuario de nivel
                              superior en esta campaña.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-info/10 border border-info/30 rounded-lg">
                        <p className="text-xs text-text-primary">
                          <strong>💡 Sugerencia:</strong> Creá primero un{" "}
                          {nivelOrdenSeleccionado === 2
                            ? "Intendente"
                            : nivelOrdenSeleccionado === 3
                              ? "Intendente o Concejal"
                              : "usuario de nivel superior"}{" "}
                          para esta campaña.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleChange("perfil_id", "");
                        }}
                        className="w-full px-4 py-2 bg-bg-base border border-border rounded-lg text-text-primary hover:bg-bg-hover transition-colors text-sm"
                      >
                        ← Elegir otro perfil
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
    </div>
  );
};

export default CrearUsuario;
