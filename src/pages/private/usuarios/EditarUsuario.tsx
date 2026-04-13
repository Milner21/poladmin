import { PageHeader } from "@components";
import { usePermisos } from "@hooks/usePermisos";
import RoutesConfig from "@routes/RoutesConfig";
import { useEffect, useMemo, useState, type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePerfiles } from "../perfiles/hooks/usePerfiles";
import { usePermisos as useListaPermisos } from "../permisos/hooks/usePermisos";
import { UsuarioForm } from "./components/UsuarioForm";
import { useActualizarUsuario } from "./hooks/useActualizarUsuario";
import { useUsuario } from "./hooks/useUsuario"; // <-- NUEVO HOOK
import toast from "react-hot-toast";

interface FormValues {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  password: string;
  confirmarPassword: string;
  perfil_id: string;
  username: string;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  documento?: string;
  perfil_id?: string;
}

const EditarUsuario: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estados del formulario
  const [values, setValues] = useState<FormValues>({
    nombre: "",
    apellido: "",
    documento: "",
    telefono: "",
    password: "",
    confirmarPassword: "",
    perfil_id: "",
    username: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Estados para Operativo
  const [tipoUsuario, setTipoUsuario] = useState<"politico" | "operativo">(
    "politico",
  );
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    [],
  );

  // Hooks de datos
  const { esRoot, esOperativo, getNivelOrden, obtenerTodosLosPermisos } =
    usePermisos();

  // USAMOS EL NUEVO HOOK PARA TRAER SOLO ESTE USUARIO (Con sus permisos)
  const { data: usuarioAEditar, isLoading: isLoadingUsuario } = useUsuario(id);

  const { data: perfiles } = usePerfiles();
  const { data: todosLosPermisosDb } = useListaPermisos();
  const actualizarMutation = useActualizarUsuario();

  // Cargar datos del usuario a editar
  useEffect(() => {
    if (!esRoot && usuarioAEditar?.perfil?.nivel?.exclusivo_root) {
      toast.error("No tenés permiso para editar este usuario");
      navigate(RoutesConfig.usuarios);
    }

    if (usuarioAEditar) {
      setValues({
        nombre: usuarioAEditar.nombre,
        apellido: usuarioAEditar.apellido,
        documento: usuarioAEditar.documento,
        telefono: usuarioAEditar.telefono ?? "",
        password: "", // No se edita por acá
        confirmarPassword: "",
        perfil_id: usuarioAEditar.perfil.id,
        username: usuarioAEditar.username,
      });

      // Si el perfil que tiene asignado es operativo, seteamos la tab correspondiente
      const esOperativoEdicion = usuarioAEditar.perfil.es_operativo;
      setTipoUsuario(esOperativoEdicion ? "operativo" : "politico");

      // Si es operativo, pre-cargamos sus permisos actuales marcados
      if (esOperativoEdicion && usuarioAEditar.permisos_personalizados) {
        const permisosPreviosIds = usuarioAEditar.permisos_personalizados.map(
          (pp) => pp.permiso_id,
        );
        setPermisosSeleccionados(permisosPreviosIds);
      }
    }
  }, [usuarioAEditar, esRoot, navigate]);

  // Filtrado de perfiles
  const nivelActual = getNivelOrden();
  const perfilesFiltrados = useMemo(() => {
    if (!perfiles) return [];

    return perfiles.filter((perfil) => {
      if (tipoUsuario === "operativo") {
        if (esOperativo) return false;
        return perfil.es_operativo;
      }

      if (tipoUsuario === "politico") {
        if (perfil.es_operativo) return false;
        if (esRoot) return perfil.nombre !== "ROOT";
        if (esOperativo) return false;
        if (!perfil.nivel) return false;
        return perfil.nivel.orden > nivelActual;
      }
      return false;
    });
  }, [perfiles, tipoUsuario, esRoot, esOperativo, nivelActual]);

  // Filtrado de permisos
  const permisosParaAsignar = useMemo(() => {
    if (!todosLosPermisosDb) return [];
    if (esRoot) return todosLosPermisosDb;

    const misPermisosNombres = obtenerTodosLosPermisos();
    return todosLosPermisosDb.filter((p) =>
      misPermisosNombres.includes(p.nombre),
    );
  }, [todosLosPermisosDb, esRoot, obtenerTodosLosPermisos]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!values.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!values.apellido.trim())
      newErrors.apellido = "El apellido es requerido";
    if (!values.perfil_id) newErrors.perfil_id = "El perfil es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTogglePermiso = (permisoId: string) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permisoId)
        ? prev.filter((pId) => pId !== permisoId)
        : [...prev, permisoId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;

    actualizarMutation.mutate(
      {
        id,
        data: {
          nombre: values.nombre.trim(),
          apellido: values.apellido.trim(),
          telefono: values.telefono.trim() || undefined,
          perfil_id: values.perfil_id,
          // Mandamos los permisos solo si el tipo actual es operativo
          permisos_ids:
            tipoUsuario === "operativo" ? permisosSeleccionados : undefined,
        },
      },
      {
        onSuccess: () => navigate(RoutesConfig.usuarios),
      },
    );
  };

  if (isLoadingUsuario || !usuarioAEditar) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={`Editar: ${usuarioAEditar.nombre} ${usuarioAEditar.apellido}`}
        subtitle={
          tipoUsuario === "operativo"
            ? "Modificá los datos y permisos de este operador"
            : "Modificá los datos de este político"
        }
        showDivider
      />

      <div className="max-w-3xl">
        <div className="bg-bg-content border border-border rounded-xl p-6 shadow-sm">
          <UsuarioForm
            values={values}
            errors={errors}
            isPending={actualizarMutation.isPending}
            isEditing={true}
            perfiles={perfilesFiltrados}
            tipoUsuario={tipoUsuario}
            permisosDisponibles={permisosParaAsignar}
            permisosSeleccionados={permisosSeleccionados}
            onTogglePermiso={handleTogglePermiso}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={() => navigate(RoutesConfig.usuarios)}
          />
        </div>
      </div>
    </div>
  );
};

export default EditarUsuario;
