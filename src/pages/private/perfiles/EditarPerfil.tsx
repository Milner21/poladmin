import { useState, useEffect, type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@components";
import { useActualizarPerfil } from "./hooks/useActualizarPerfil";
import { useAsignarPermisos } from "./hooks/useAsignarPermisos";
import { usePermisos as useListaPermisos } from "../permisos/hooks/usePermisos";
import { usePerfiles } from "./hooks/usePerfiles";
import { useNiveles } from "../niveles/hooks/useNiveles";
import { PerfilForm } from "./components/PerfilForm";
import { AsignarPermisos } from "./components/AsignarPermisos";
import RoutesConfig from "@routes/RoutesConfig";

interface FormValues {
  nombre: string;
  nivel_id: string;
  es_operativo: boolean;
  username_manual: boolean;
}

interface FormErrors {
  nombre?: string;
  nivel_id?: string;
}

const EditarPerfil: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>({
    nombre: "",
    nivel_id: "",
    es_operativo: false,
    username_manual: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    [],
  );

  const { data: perfiles } = usePerfiles();
  const { data: permisos } = useListaPermisos();
  const { data: niveles } = useNiveles();
  const actualizarMutation = useActualizarPerfil();
  const asignarMutation = useAsignarPermisos();

  const perfil = perfiles?.find((p) => p.id === id);

  useEffect(() => {
    if (perfil) {
      setValues({
        nombre: perfil.nombre,
        nivel_id: perfil.nivel_id ?? "",
        es_operativo: perfil.es_operativo,
        username_manual: perfil.username_manual,
      });
      setPermisosSeleccionados(perfil.permisos.map((pp) => pp.permiso_id));
    }
  }, [perfil]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!values.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!values.es_operativo && !values.nivel_id) {
      newErrors.nivel_id = "El nivel es requerido para perfiles políticos";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: "nombre" | "nivel_id", value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleChangeBoolean = (
    field: "es_operativo" | "username_manual",
    value: boolean,
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
      nivel_id: field === "es_operativo" && value ? "" : prev.nivel_id,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;

    actualizarMutation.mutate(
      {
        id,
        data: {
          nombre: values.nombre.trim().toUpperCase(),
          nivel_id: values.es_operativo ? undefined : values.nivel_id,
          es_operativo: values.es_operativo,
          username_manual: values.username_manual,
        },
      },
      { onSuccess: () => navigate(RoutesConfig.perfiles) },
    );
  };

  const handleTogglePermiso = (permisoId: string) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(permisoId)
        ? prev.filter((pid) => pid !== permisoId)
        : [...prev, permisoId],
    );
  };

  const handleGuardarPermisos = () => {
    if (!id) return;
    asignarMutation.mutate(
      { id, permisos_ids: permisosSeleccionados },
      { onSuccess: () => navigate(RoutesConfig.perfiles) },
    );
  };

  if (!perfil) {
    return (
      <div className="flex justify-center py-10">
        <span className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4 px-6">
      <PageHeader
        title={`Editar: ${perfil.nombre}`}
        subtitle="Modificá los datos del perfil y sus permisos"
        showDivider
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Form */}
        <div className="bg-bg-content border border-border rounded-xl p-6">
          <h4 className="text-base font-semibold text-text-primary mb-4">
            Datos del Perfil
          </h4>
          <PerfilForm
            values={values}
            errors={errors}
            isPending={actualizarMutation.isPending}
            isEditing={true}
            niveles={niveles ?? []}
            onChange={handleChange}
            onChangeBoolean={handleChangeBoolean}
            onSubmit={handleSubmit}
            onCancel={() => navigate(RoutesConfig.perfiles)}
          />
        </div>

        {/* Asignar permisos */}
        {permisos && (
          <AsignarPermisos
            permisos={permisos}
            permisosSeleccionados={permisosSeleccionados}
            isPending={asignarMutation.isPending}
            onChange={handleTogglePermiso}
            onGuardar={handleGuardarPermisos}
          />
        )}
      </div>
    </div>
  );
};

export default EditarPerfil;
